import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ApiError, createAuthAdapter } from '../../../api/core/index'
import { useTheme } from '../../../theme/theme-context'
import { useAuth } from '../auth-context'
import { resolveDashboardRole } from '../roles'
import { AdaLogoMark } from '../../landing/components/brand/AdaLogoMark'

export function AdminLoginPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isAuthenticated, isHydrating, session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authApi = createAuthAdapter()

  if (isHydrating) {
    return null
  }

  if (isAuthenticated && session) {
    const role = resolveDashboardRole(session)
    if (role === 'admin') return <Navigate to="/admin/overview" replace />
    if (role === 'employer') return <Navigate to="/employer" replace />
    return <Navigate to="/worker" replace />
  }

  const isDark = theme === 'dark'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const normalizedEmail = email.trim()
      const authResult = await authApi.login({
        email: normalizedEmail,
        password,
        audience: 'admin',
      })
      signIn({ authResult, audience: 'admin', email: normalizedEmail })
      navigate('/admin/overview', { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.code === 'AUTH_NOT_CONFIGURED') {
        setError(t('auth.feedback.authNotConfigured'))
      } else {
        setError(t('auth.feedback.genericError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md items-center px-4 py-8">
      <div
        className={`w-full rounded-3xl border p-6 shadow-2xl sm:p-8 ${
          isDark ? 'border-white/10 bg-[#0b0e14]/95' : 'border-sky-200 bg-white'
        }`}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
              isDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white'
            }`}
          >
            <AdaLogoMark className={`h-7 w-7 ${isDark ? 'text-slate-100' : 'text-[#0b2a66]'}`} />
          </span>
          <div>
            <h1 className={`font-display text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('auth.login.title')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              {t('auth.login.subtitleCorporate')}
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-1.5">
            <span className={`text-xs font-medium ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
              {t('auth.login.emailLabel')}
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              placeholder={t('auth.login.emailPlaceholder')}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 ${
                isDark
                  ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35'
                  : 'border-sky-200 bg-white text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={`text-xs font-medium ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
              {t('auth.login.passwordLabel')}
            </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder={t('auth.login.passwordPlaceholder')}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 ${
                isDark
                  ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35'
                  : 'border-sky-200 bg-white text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              isDark
                ? 'bg-[#14f1d9] text-[#041014] hover:bg-[#62ffee]'
                : 'bg-sky-600 text-white hover:bg-sky-500'
            }`}
          >
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>
        </form>

        {error ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              isDark
                ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                : 'border-rose-300 bg-rose-50 text-rose-700'
            }`}
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
