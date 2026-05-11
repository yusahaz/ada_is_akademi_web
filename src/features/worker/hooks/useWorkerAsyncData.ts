import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'

type AsyncState<TData> = {
  loading: boolean
  error: string | null
  data: TData
  reload: () => Promise<void>
  setData: Dispatch<SetStateAction<TData>>
}

type UseWorkerAsyncDataOptions = {
  /** When false, the query does not run (e.g. waiting for geolocation). */
  enabled?: boolean
}

export function useWorkerAsyncData<TData>(
  initialData: TData,
  queryKey: QueryKey,
  query: () => Promise<TData>,
  resolveError: (error: unknown) => string,
  options?: UseWorkerAsyncDataOptions,
): AsyncState<TData> {
  const queryClient = useQueryClient()
  const enabled = options?.enabled ?? true
  const result = useQuery<TData, unknown>({
    queryKey,
    queryFn: query,
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  })
  const { refetch } = result

  const runQuery = useCallback(async () => {
    await refetch()
  }, [refetch])

  const setData: Dispatch<SetStateAction<TData>> = useCallback(
    (value) => {
      queryClient.setQueryData<TData>(queryKey, (prev) => {
        const base = (prev ?? initialData) as TData
        if (typeof value === 'function') {
          return (value as (prevState: TData) => TData)(base)
        }
        return value
      })
    },
    [initialData, queryClient, queryKey],
  )

  return {
    loading: enabled && (result.isPending || result.isFetching),
    error: result.error ? resolveError(result.error) : null,
    data: result.data ?? initialData,
    reload: runQuery,
    setData,
  }
}
