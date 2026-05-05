import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WorkerProfileData } from '../../../api/worker-portal'
import { workerPortalApi } from '../../../api/worker-portal'
import { useTheme } from '../../../theme/theme-context'

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

  if (loading) return <Card text={t('dashboard.workerPortal.states.loading')} theme={theme} />
  if (error) return <Card text={error} theme={theme} isError />
  if (!profile) return <Card text={t('dashboard.workerPortal.states.empty')} theme={theme} />

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <article className={`rounded-xl border p-4 ${resolveCard(theme)}`}>
        <h2 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{t('dashboard.workerPortal.profile.basic')}</h2>
        <div className={`mt-3 space-y-2 text-sm ${resolveMuted(theme)}`}>
          <p>{t('dashboard.workerPortal.profile.fullName', { value: profile.fullName })}</p>
          <p>{t('dashboard.workerPortal.profile.email', { value: profile.email })}</p>
          <p>{t('dashboard.workerPortal.profile.nationality', { value: profile.nationality })}</p>
          <p>{t('dashboard.workerPortal.profile.university', { value: profile.university })}</p>
          <p>{t('dashboard.workerPortal.profile.studentNumber', { value: profile.studentNumber })}</p>
        </div>
      </article>

      <article className={`rounded-xl border p-4 ${resolveCard(theme)}`}>
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
      </article>
    </div>
  )
}

function Card({ text, theme, isError = false }: { text: string; theme: 'light' | 'dark'; isError?: boolean }) {
  const classes = isError
    ? theme === 'dark'
      ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
      : 'border-amber-300 bg-amber-50 text-amber-800'
    : theme === 'dark'
      ? 'border-white/10 bg-white/[0.04] text-white/75'
      : 'border-slate-300/80 bg-white text-slate-700'
  return <p className={`rounded-xl border px-3 py-2 text-sm ${classes}`}>{text}</p>
}

function resolveCard(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300/80 bg-white'
}

function resolveTitle(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white' : 'text-slate-900'
}

function resolveMuted(theme: 'light' | 'dark') {
  return theme === 'dark' ? 'text-white/75' : 'text-slate-600'
}
