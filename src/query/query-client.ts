import { QueryClient } from '@tanstack/react-query'

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      retry: 1,
    },
  },
})
