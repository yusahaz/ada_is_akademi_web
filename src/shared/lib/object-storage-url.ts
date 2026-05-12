export function sanitizeObjectStorageUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getLocalhostProtocolFallbackUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
    if (!isLocalHost) return null

    if (parsed.protocol === 'https:') {
      parsed.protocol = 'http:'
      return parsed.toString()
    }
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:'
      return parsed.toString()
    }
    return null
  } catch {
    return null
  }
}

export function resolveObjectStorageUrlCandidates(raw: unknown): string[] {
  const primary = sanitizeObjectStorageUrl(raw)
  if (!primary) return []

  const fallback = getLocalhostProtocolFallbackUrl(primary)
  if (!fallback || fallback === primary) {
    return [primary]
  }
  return [primary, fallback]
}
