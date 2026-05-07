import { useQuery } from '@tanstack/react-query'

import { workerPortalApi, type WorkerLiveCounters } from '../../../api/worker/worker-portal'

const EMPTY_COUNTERS: WorkerLiveCounters = {
  pendingPayouts: 0,
  newMatches: 0,
  upcomingShifts: 0,
  unreadNotifications: 0,
}

export function useWorkerLiveCounters(): WorkerLiveCounters {
  const result = useQuery<WorkerLiveCounters>({
    queryKey: ['worker', 'live-counters'],
    queryFn: () => workerPortalApi.getLiveCounters(),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  })
  return result.data ?? EMPTY_COUNTERS
}
