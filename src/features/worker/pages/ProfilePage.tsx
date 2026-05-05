import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerProfileData } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'
import { DashboardSurface, StatePanel } from '../../../components/dashboard/ui-primitives'

export function ProfilePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<WorkerProfileData | null>(null)

  useEffect(() => {
    let active = true
    void workerPortalApi
      .getProfile()
      .then((response) => {
        if (!active) return
        setProfile(response)
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setError(t('dashboard.workerPortal.states.fetchError'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t])

  if (loading) return <StatePanel text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <StatePanel text={error} theme={theme} isError />
  if (!profile) return <StatePanel text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <DashboardSurface theme={theme}>
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.basic')}</h2>
        <div className={`mt-3 space-y-2 text-sm ${resolveMuted(theme)}`}>
          <p>{t('dashboard.workerPortal.profile.fullName', { value: profile.fullName })}</p>
          <p>{t('dashboard.workerPortal.profile.email', { value: profile.email })}</p>
          <p>{t('dashboard.workerPortal.profile.nationality', { value: profile.nationality })}</p>
          <p>{t('dashboard.workerPortal.profile.university', { value: profile.university })}</p>
          <p>{t('dashboard.workerPortal.profile.studentNumber', { value: profile.studentNumber })}</p>
        </div>
      </DashboardSurface>

      <DashboardSurface theme={theme}>
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.skills')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.skills.length > 0 ? profile.skills : ['-']).map((skill) => (
            <span
              key={skill}
              className={`rounded-md px-2 py-1 text-xs ${theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'}`}
            >
              {skill}
            </span>
          ))}
        </div>
      </DashboardSurface>
    </div>
  )
}

function resolveTitle(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white' : 'text-slate-900'
}

function resolveMuted(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white/75' : 'text-slate-600'
}
