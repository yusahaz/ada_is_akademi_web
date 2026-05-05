/**
 * Normalizes pageable API responses that may be either a bare array
 * or an envelope with `data`, `totalCount`, etc. (matches Workers/List pattern).
 */
export type PageableEnvelope<T> = {
  data: T[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

export type PageableListResult<T> = T[] | PageableEnvelope<T>

export function normalizePageableList<T>(value: PageableListResult<T>): {
  rows: T[]
  totalCount: number
} {
  if (Array.isArray(value)) {
    return { rows: value, totalCount: value.length }
  }
  const rows = value.data ?? []
  const rawTotal = Number(value.totalCount ?? rows.length)
  return {
    rows,
    totalCount: Number.isFinite(rawTotal) ? rawTotal : rows.length,
  }
}
