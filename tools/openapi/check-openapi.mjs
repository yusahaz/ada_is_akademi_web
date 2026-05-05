import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

const OPENAPI_URL = 'http://localhost:15080/openapi/v1.json'
const ENDPOINTS_FILE = path.join(repoRoot, 'src', 'api', 'endpoints.ts')
const API_DIR = path.join(repoRoot, 'src', 'api')
const BASELINE_FILE = path.join(__dirname, '.baseline', 'openapi-v1.last.json')
const REPORT_DIR = path.join(__dirname, 'reports')
const REPORT_MD_FILE = path.join(REPORT_DIR, 'latest.md')
const REPORT_JSON_FILE = path.join(REPORT_DIR, 'latest.json')

const shouldRefreshBaseline = process.argv.includes('--refresh-baseline')
const failOnBreaking = process.argv.includes('--fail-on-breaking')

async function readJsonIfExists(targetPath) {
  try {
    const raw = await readFile(targetPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function fetchOpenApiSpec(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`OpenAPI fetch failed with status ${response.status}`)
    }
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function toPathName(rawPath) {
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath
}

function extractSpecOperations(spec) {
  const operations = new Map()
  const paths = spec?.paths ?? {}
  for (const [rawPath, methods] of Object.entries(paths)) {
    const pathName = toPathName(rawPath)
    if (!methods || typeof methods !== 'object') continue
    for (const [method, operation] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue
      operations.set(`${method.toUpperCase()} ${pathName}`, {
        method: method.toUpperCase(),
        path: pathName,
        requestSchemaRef: operation?.requestBody?.content?.['application/json']?.schema?.$ref ?? null,
        responseSchemaRef:
          operation?.responses?.['200']?.content?.['application/json']?.schema?.$ref ?? null,
      })
    }
  }
  return operations
}

function parseEndpointValueMap(endpointsSource) {
  const valueMap = new Map()
  const regex = /API_ENDPOINTS((?:\.[a-zA-Z0-9_]+)+)\s*[,)}\]]/g
  const valueRegex = /([a-zA-Z0-9_]+)\s*:\s*'([^']+)'/g
  const values = []

  for (const match of endpointsSource.matchAll(valueRegex)) {
    values.push(match[2])
  }

  let pointer = 0
  for (const match of endpointsSource.matchAll(regex)) {
    const key = `API_ENDPOINTS${match[1]}`
    if (!valueMap.has(key) && pointer < values.length) {
      valueMap.set(key, values[pointer])
      pointer += 1
    }
  }

  const literalRegex = /([a-zA-Z0-9_]+)\s*:\s*'([^']+)'/g
  const stack = []
  let currentObject = 'API_ENDPOINTS'
  const lines = endpointsSource.split('\n')

  for (const lineRaw of lines) {
    const line = lineRaw.trim()
    if (line.endsWith('{')) {
      const keyMatch = /^([a-zA-Z0-9_]+)\s*:/.exec(line)
      if (keyMatch) {
        stack.push(keyMatch[1])
        currentObject = `API_ENDPOINTS.${stack.join('.')}`
      }
    }
    if (line.startsWith('}')) {
      stack.pop()
      currentObject = stack.length ? `API_ENDPOINTS.${stack.join('.')}` : 'API_ENDPOINTS'
    }
    const item = literalRegex.exec(line)
    if (item) {
      const key = `${currentObject}.${item[1]}`
      valueMap.set(key, item[2])
    }
    literalRegex.lastIndex = 0
  }

  return valueMap
}

function resolveEndpointPath(argument, endpointMap, variableMap) {
  const trimmed = argument.trim()
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1)
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
  }
  if (trimmed.startsWith('API_ENDPOINTS.')) {
    return endpointMap.get(trimmed) ?? null
  }
  if (variableMap.has(trimmed)) {
    return variableMap.get(trimmed) ?? null
  }
  const wrappedVarMatch = /^ensurePath\(([a-zA-Z0-9_]+)\)$/.exec(trimmed)
  if (wrappedVarMatch && variableMap.has(wrappedVarMatch[1])) {
    return variableMap.get(wrappedVarMatch[1]) ?? null
  }
  const wrappedMatch = /^ensurePath\((API_ENDPOINTS\.[a-zA-Z0-9_.]+)\)$/.exec(trimmed)
  if (wrappedMatch) {
    return endpointMap.get(wrappedMatch[1]) ?? null
  }
  return null
}

function extractUsedEndpoints(fileContent, filePath, endpointMap) {
  const results = []
  const variableMap = new Map()
  const varRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*(API_ENDPOINTS\.[a-zA-Z0-9_.]+)/g
  for (const match of fileContent.matchAll(varRegex)) {
    const resolved = endpointMap.get(match[2]) ?? null
    if (resolved) {
      variableMap.set(match[1], resolved)
    }
  }

  const callRegex = /client\.(post|put|get|delete|patch)\s*<[\s\S]*?>\(\s*([^,\n]+),/g
  for (const match of fileContent.matchAll(callRegex)) {
    const method = match[1].toUpperCase()
    const pathArg = match[2].trim()
    const resolvedPath = resolveEndpointPath(pathArg, endpointMap, variableMap)
    results.push({
      file: filePath,
      method,
      pathArg,
      resolvedPath,
    })
  }
  return results
}

function getOperation(specOps, method, endpointPath) {
  return specOps.get(`${method} ${endpointPath}`) ?? null
}

function compareUsedEndpoints(usedEndpoints, currentSpecOps, baselineSpecOps) {
  const breaking = []
  const attention = []
  const safe = []

  for (const endpoint of usedEndpoints) {
    if (!endpoint.resolvedPath) {
      attention.push({
        type: 'UNRESOLVED_ENDPOINT_REFERENCE',
        endpoint,
        message: 'Endpoint path expression could not be resolved.',
      })
      continue
    }

    const currentOp = getOperation(currentSpecOps, endpoint.method, endpoint.resolvedPath)
    if (!currentOp) {
      const hasAnyMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].some((candidateMethod) =>
        getOperation(currentSpecOps, candidateMethod, endpoint.resolvedPath),
      )
      breaking.push({
        type: hasAnyMethod ? 'METHOD_CHANGED' : 'ENDPOINT_REMOVED',
        endpoint,
        message: hasAnyMethod
          ? 'Endpoint path exists but expected method does not exist.'
          : 'Endpoint path not found in current OpenAPI.',
      })
      continue
    }

    if (!baselineSpecOps) {
      safe.push({
        type: 'BASELINE_MISSING',
        endpoint,
        message: 'No baseline found; endpoint validated against current OpenAPI only.',
      })
      continue
    }

    const previousOp = getOperation(baselineSpecOps, endpoint.method, endpoint.resolvedPath)
    if (!previousOp) {
      safe.push({
        type: 'NEW_OR_UNTRACKED',
        endpoint,
        message: 'Endpoint exists in current OpenAPI but not in baseline with same method.',
      })
      continue
    }

    if (previousOp.requestSchemaRef !== currentOp.requestSchemaRef) {
      breaking.push({
        type: 'REQUEST_SCHEMA_CHANGED',
        endpoint,
        before: previousOp.requestSchemaRef,
        after: currentOp.requestSchemaRef,
        message: 'Request schema reference changed.',
      })
    }

    if (previousOp.responseSchemaRef !== currentOp.responseSchemaRef) {
      breaking.push({
        type: 'RESPONSE_SCHEMA_CHANGED',
        endpoint,
        before: previousOp.responseSchemaRef,
        after: currentOp.responseSchemaRef,
        message: 'Response schema reference changed.',
      })
    }

    if (
      previousOp.requestSchemaRef === currentOp.requestSchemaRef &&
      previousOp.responseSchemaRef === currentOp.responseSchemaRef
    ) {
      safe.push({
        type: 'UNCHANGED',
        endpoint,
        message: 'No request/response schema ref change detected.',
      })
    }
  }

  return { breaking, attention, safe }
}

function formatItemLine(item) {
  return `- \`${item.endpoint.method} ${item.endpoint.resolvedPath ?? item.endpoint.pathArg}\` in \`${item.endpoint.file}\`: ${item.message}`
}

function formatDiffReport({ comparedAt, stats, breaking, attention, safe, usedEndpoints }) {
  const lines = [
    '# OpenAPI Diff Report',
    '',
    `Compared at: ${comparedAt}`,
    `OpenAPI source: ${OPENAPI_URL}`,
    '',
    '## Summary',
    `- Used endpoint calls scanned: ${usedEndpoints.length}`,
    `- Breaking changes: ${stats.breaking}`,
    `- Attention items: ${stats.attention}`,
    `- Safe/unchanged checks: ${stats.safe}`,
    '',
  ]

  lines.push('## Breaking')
  if (breaking.length === 0) {
    lines.push('- None')
  } else {
    for (const item of breaking) {
      lines.push(formatItemLine(item))
      if (item.before !== undefined || item.after !== undefined) {
        lines.push(`  - before: \`${item.before ?? 'null'}\``)
        lines.push(`  - after: \`${item.after ?? 'null'}\``)
      }
    }
  }
  lines.push('')

  lines.push('## Attention')
  if (attention.length === 0) {
    lines.push('- None')
  } else {
    for (const item of attention) {
      lines.push(formatItemLine(item))
    }
  }
  lines.push('')

  lines.push('## Safe')
  if (safe.length === 0) {
    lines.push('- None')
  } else {
    for (const item of safe) {
      lines.push(formatItemLine(item))
    }
  }

  return `${lines.join('\n')}\n`
}

async function listApiFiles() {
  const indexSource = await readFile(path.join(API_DIR, 'index.ts'), 'utf8').catch(() => '')
  const exportRegex = /from\s+'\.\/([^']+)'/g
  const fileNames = new Set()
  for (const match of indexSource.matchAll(exportRegex)) {
    fileNames.add(`${match[1]}.ts`)
  }
  if (fileNames.size === 0) {
    return []
  }
  return [...fileNames].map((name) => path.join(API_DIR, name))
}

async function main() {
  const [currentSpec, baselineSpec, endpointsSource, apiFiles] = await Promise.all([
    fetchOpenApiSpec(OPENAPI_URL),
    readJsonIfExists(BASELINE_FILE),
    readFile(ENDPOINTS_FILE, 'utf8'),
    listApiFiles(),
  ])

  const endpointMap = parseEndpointValueMap(endpointsSource)
  const usedEndpoints = []
  for (const filePath of apiFiles) {
    if (filePath.endsWith('client.ts') || filePath.endsWith('config.ts') || filePath.endsWith('types.ts')) {
      continue
    }
    const content = await readFile(filePath, 'utf8')
    usedEndpoints.push(...extractUsedEndpoints(content, path.relative(repoRoot, filePath), endpointMap))
  }

  const currentSpecOps = extractSpecOperations(currentSpec)
  const baselineSpecOps = baselineSpec ? extractSpecOperations(baselineSpec) : null
  const comparison = compareUsedEndpoints(usedEndpoints, currentSpecOps, baselineSpecOps)

  const reportJson = {
    comparedAt: new Date().toISOString(),
    openApiSource: OPENAPI_URL,
    baselineExists: Boolean(baselineSpec),
    stats: {
      breaking: comparison.breaking.length,
      attention: comparison.attention.length,
      safe: comparison.safe.length,
      usedEndpointCalls: usedEndpoints.length,
    },
    usedEndpoints,
    ...comparison,
  }

  const reportMd = formatDiffReport({
    comparedAt: reportJson.comparedAt,
    stats: reportJson.stats,
    breaking: comparison.breaking,
    attention: comparison.attention,
    safe: comparison.safe,
    usedEndpoints,
  })

  await mkdir(path.dirname(BASELINE_FILE), { recursive: true })
  await mkdir(REPORT_DIR, { recursive: true })
  await writeFile(REPORT_JSON_FILE, JSON.stringify(reportJson, null, 2), 'utf8')
  await writeFile(REPORT_MD_FILE, reportMd, 'utf8')

  if (shouldRefreshBaseline) {
    await writeFile(BASELINE_FILE, JSON.stringify(currentSpec, null, 2), 'utf8')
  }

  if (failOnBreaking && comparison.breaking.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('[openapi-check] failed:', error?.message ?? error)
  process.exitCode = 1
})
