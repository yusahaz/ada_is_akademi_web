import { useEffect, useState } from 'react'

export type JobsMapGeoPhase = 'resolving' | 'ready' | 'fallback'

export type JobsMapGeolocation = {
  phase: JobsMapGeoPhase
  latitude: number | null
  longitude: number | null
  errorCode: GeolocationPositionError['code'] | null
}

/**
 * Requests a one-shot browser position when the jobs map tab needs server-side distance filtering.
 * Falls back to `fallback` (no coordinates) if the API is missing, permission denied, or timeout.
 */
export function useJobsMapGeolocation(isActive: boolean): JobsMapGeolocation {
  const [state, setState] = useState<JobsMapGeolocation>({
    phase: 'resolving',
    latitude: null,
    longitude: null,
    errorCode: null,
  })

  useEffect(() => {
    if (!isActive) {
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ phase: 'fallback', latitude: null, longitude: null, errorCode: null })
      return
    }

    let cancelled = false
    setState({ phase: 'resolving', latitude: null, longitude: null, errorCode: null })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setState({
          phase: 'ready',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          errorCode: null,
        })
      },
      (err) => {
        if (cancelled) return
        setState({
          phase: 'fallback',
          latitude: null,
          longitude: null,
          errorCode: err.code,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 120_000,
      },
    )

    return () => {
      cancelled = true
    }
  }, [isActive])

  return state
}
