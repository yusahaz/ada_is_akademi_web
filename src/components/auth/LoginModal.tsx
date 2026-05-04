import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiError, createAuthAdapter } from '../../api'
import { useAuth } from '../../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import { AdaLogoMark } from '../landing/AdaLogoMark'
import { IconX } from '../landing/icons'

type LoginModalProps = {
  open: boolean
  onClose: () => void
}

type Audience = 'individual' | 'corporate'
type AuthView = 'login' | 'register'

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const { theme } = useTheme()
  const titleId = useId()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const fullNameInputRef = useRef<HTMLInputElement>(null)

  const [audience, setAudience] = useState<Audience>('individual')
  const [authView, setAuthView] = useState<AuthView>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const authApi = useMemo(() => createAuthAdapter(), [])

  const effectiveView: AuthView =
    audience === 'corporate' ? 'login' : authView

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      if (effectiveView === 'register') {
        fullNameInputRef.current?.focus()
      } else {
        emailInputRef.current?.focus()
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, effectiveView])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function clearFeedback() {
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const isRegister = effectiveView === 'register'
  const isDark = theme === 'dark'

  const headline = isRegister ? t('auth.register.title') : t('auth.login.title')

  const subline = (() => {
    if (isRegister) {
      return t('auth.register.subtitle')
    }
    if (audience === 'corporate') {
      return t('auth.login.subtitleCorporate')
    }
    return t('auth.login.subtitleIndividual')
  })()

  const panelClass = isDark
    ? 'border-white/10 bg-[#0b0e14]/95 ring-white/5'
    : 'border-sky-200 bg-white/95 ring-sky-200/70'

  const closeButtonClass = isDark
    ? 'text-white/70 hover:bg-white/10 hover:text-white'
    : 'text-slate-500 hover:bg-sky-100 hover:text-slate-900'

  const titleClass = isDark ? 'text-white' : 'text-slate-900'
  const subtitleClass = isDark ? 'text-white/60' : 'text-slate-600'

  const segmentClass = isDark
    ? 'bg-white/[0.06] ring-white/10'
    : 'bg-sky-50 ring-sky-200'

  const inactiveSegmentClass = isDark
    ? 'text-white/60 hover:text-white/90'
    : 'text-slate-500 hover:text-slate-700'

  const labelClass = isDark ? 'text-white/75' : 'text-slate-700'

  const inputClass = isDark
    ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35'
    : 'border-sky-200 bg-white text-slate-900 placeholder:text-slate-400'

  const helperTextClass = isDark ? 'text-white/60' : 'text-slate-600'

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      const authResult = await authApi.login({ email, password, audience })
      signIn({ authResult, audience, email })
      setSubmitSuccess(t('auth.feedback.loginSuccess'))
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_NOT_CONFIGURED') {
        setSubmitError(t('auth.feedback.authNotConfigured'))
      } else {
        setSubmitError(t('auth.feedback.genericError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setSubmitSuccess(null)
      setSubmitError(t('auth.feedback.passwordMismatch'))
      return
    }

    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      await authApi.register({ fullName, email, password, audience })
      setSubmitSuccess(t('auth.feedback.registerSuccess'))
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH_NOT_CONFIGURED') {
        setSubmitError(t('auth.feedback.authNotConfigured'))
      } else {
        setSubmitError(t('auth.feedback.genericError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-slate-900/25'}`}
        aria-label={t('auth.login.closeAria')}
        onClick={onClose}
      />

      <div
        className={`relative z-[101] w-full max-w-md rounded-3xl border p-6 shadow-[0_-24px_80px_rgba(0,0,0,0.55)] ring-1 backdrop-blur-xl sm:p-8 sm:shadow-2xl ${panelClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={`absolute end-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${closeButtonClass}`}
          onClick={onClose}
          aria-label={t('auth.login.closeAria')}
        >
          <IconX className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3 text-start">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14f1d9]/15 ring-1 ring-[#14f1d9]/25">
            <AdaLogoMark className="h-8 w-8 text-[#14f1d9]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className={`font-display text-xl font-semibold tracking-tight ${titleClass}`}
            >
              {headline}
            </h2>
            <p className={`mt-1 text-sm ${subtitleClass}`}>{subline}</p>
          </div>
        </div>

        <div
          className={`mb-6 flex rounded-2xl p-1 ring-1 ${segmentClass}`}
          role="tablist"
          aria-label={t('auth.audienceAria')}
        >
          <button
            type="button"
            role="tab"
            disabled={isSubmitting}
            aria-selected={audience === 'individual'}
            className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition sm:text-sm ${
              audience === 'individual'
                ? 'bg-[#14f1d9]/15 text-[#14f1d9] ring-1 ring-[#14f1d9]/30'
                : inactiveSegmentClass
            }`}
            onClick={() => {
              clearFeedback()
              setAudience('individual')
            }}
          >
            {t('auth.audience.individual')}
          </button>
          <button
            type="button"
            role="tab"
            disabled={isSubmitting}
            aria-selected={audience === 'corporate'}
            className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition sm:text-sm ${
              audience === 'corporate'
                ? 'bg-[#14f1d9]/15 text-[#14f1d9] ring-1 ring-[#14f1d9]/30'
                : inactiveSegmentClass
            }`}
            onClick={() => {
              clearFeedback()
              setAudience('corporate')
            }}
          >
            {t('auth.audience.corporate')}
          </button>
        </div>

        {isRegister ? (
          <form
            className="space-y-4"
            onSubmit={handleRegisterSubmit}
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor="register-full-name"
                className={`block text-xs font-medium ${labelClass}`}
              >
                {t('auth.register.fullNameLabel')}
              </label>
              <input
                ref={fullNameInputRef}
                id="register-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder={t('auth.register.fullNamePlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className={`block text-xs font-medium ${labelClass}`}
              >
                {t('auth.register.emailLabel')}
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.register.emailPlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className={`block text-xs font-medium ${labelClass}`}
              >
                {t('auth.register.passwordLabel')}
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.register.passwordPlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password-confirm"
                className={`block text-xs font-medium ${labelClass}`}
              >
                {t('auth.register.confirmPasswordLabel')}
              </label>
              <input
                id="register-password-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-2xl bg-[#14f1d9] text-sm font-semibold text-[#041014] shadow-[0_16px_50px_rgba(20,241,217,0.22)] transition hover:bg-[#62ffee] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? t('auth.register.submitting')
                : t('auth.register.submit')}
            </button>

            <p className={`text-center text-sm ${helperTextClass}`}>
              <button
                type="button"
                disabled={isSubmitting}
                className="font-medium text-[#14f1d9] underline-offset-4 hover:underline"
                onClick={() => {
                  clearFeedback()
                  setAuthView('login')
                }}
              >
                {t('auth.login.goToLogin')}
              </button>
            </p>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit}
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className={`block text-xs font-medium ${labelClass}`}
              >
                {t('auth.login.emailLabel')}
              </label>
              <input
                ref={emailInputRef}
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.login.emailPlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className={`block text-xs font-medium ${labelClass}`}
                >
                  {t('auth.login.passwordLabel')}
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[#14f1d9] underline-offset-4 hover:underline"
                  onClick={() => {
                    /* Recovery flow TBD */
                  }}
                >
                  {t('auth.login.forgot')}
                </button>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.login.passwordPlaceholder')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20 ${inputClass}`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-2xl bg-[#14f1d9] text-sm font-semibold text-[#041014] shadow-[0_16px_50px_rgba(20,241,217,0.22)] transition hover:bg-[#62ffee] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>

            {audience === 'individual' ? (
              <p className={`text-center text-sm ${helperTextClass}`}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="font-medium text-[#14f1d9] underline-offset-4 hover:underline"
                  onClick={() => {
                    clearFeedback()
                    setAuthView('register')
                  }}
                >
                  {t('auth.login.goToRegister')}
                </button>
              </p>
            ) : null}
          </form>
        )}

        {submitError ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              isDark
                ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                : 'border-rose-300 bg-rose-50 text-rose-700'
            }`}
          >
            {submitError}
          </p>
        ) : null}
        {submitSuccess ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              isDark
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                : 'border-emerald-300 bg-emerald-50 text-emerald-700'
            }`}
          >
            {submitSuccess}
          </p>
        ) : null}
      </div>
    </div>
  )
}
