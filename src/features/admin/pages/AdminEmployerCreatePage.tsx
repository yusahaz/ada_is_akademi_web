import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { adminManagementApi } from '../../../api/admin/admin-management'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'

export function AdminEmployerCreatePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: notifyError } = useNotification()

  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-w-0',
    theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
  )

  const [employerName, setEmployerName] = useState('')
  const [employerDescription, setEmployerDescription] = useState('')
  const [employerTaxNumber, setEmployerTaxNumber] = useState('')
  const [employerAddressLine1, setEmployerAddressLine1] = useState('')
  const [employerAddressCity, setEmployerAddressCity] = useState('')
  const [employerAddressCountry, setEmployerAddressCountry] = useState('TR')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const en = employerName.trim()
    const tax = employerTaxNumber.trim()
    const line1 = employerAddressLine1.trim()
    const city = employerAddressCity.trim()
    const country = employerAddressCountry.trim() || 'TR'
    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()
    const ph = phone.trim()
    if (!en || !tax || !line1 || !city || !country || !fn || !ln || !em || !ph || !password.trim()) {
      setFormError(t('dashboard.admin.employers.create.validationRequired'))
      return
    }
    setBusy(true)
    try {
      const employerId = await adminManagementApi.registerEmployer({
        employerName: en,
        employerDescription: employerDescription.trim() || null,
        employerTaxNumber: tax,
        employerAddressLine1: line1,
        employerAddressCity: city,
        employerAddressCountry: country,
        firstName: fn,
        lastName: ln,
        email: em,
        phone: ph,
        password,
      })
      success(t('dashboard.admin.employers.create.success'))
      navigate(`/admin/employers/${employerId}`, { replace: true })
    } catch {
      notifyError(t('dashboard.admin.employers.create.error'))
    } finally {
      setBusy(false)
    }
  }

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/admin/employers')}
        className={cn(
          'mb-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
          theme === 'dark' ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('dashboard.admin.employers.create.back')}
      </button>

      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.employers.create.title')}
        description={t('dashboard.admin.employers.create.subtitle')}
      />

      <DashboardSurface theme={theme}>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {formError ? <StatePanel theme={theme} text={formError} isError /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.create.employerName')}
              </span>
              <input
                className={inputClass}
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                autoComplete="organization"
                required
              />
            </label>
            <label className="sm:col-span-2">
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.create.description')}
              </span>
              <textarea
                className={cn(inputClass, 'min-h-[88px] resize-y')}
                value={employerDescription}
                onChange={(e) => setEmployerDescription(e.target.value)}
                rows={3}
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.taxNo')}
              </span>
              <input
                className={inputClass}
                value={employerTaxNumber}
                onChange={(e) => setEmployerTaxNumber(e.target.value)}
                autoComplete="off"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.create.addressLine')}
              </span>
              <input
                className={inputClass}
                value={employerAddressLine1}
                onChange={(e) => setEmployerAddressLine1(e.target.value)}
                autoComplete="street-address"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.create.city')}
              </span>
              <input
                className={inputClass}
                value={employerAddressCity}
                onChange={(e) => setEmployerAddressCity(e.target.value)}
                autoComplete="address-level2"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.employers.create.country')}
              </span>
              <input
                className={inputClass}
                value={employerAddressCountry}
                onChange={(e) => setEmployerAddressCountry(e.target.value)}
                autoComplete="country"
              />
            </label>
          </div>

          <p className={`text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
            {t('dashboard.admin.employers.create.contactSection')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.register.firstName')}
              </span>
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.register.lastName')}
              </span>
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.register.email')}
              </span>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.register.phone')}
              </span>
              <input
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </label>
            <label className="sm:col-span-2">
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>
                {t('dashboard.admin.register.password')}
              </span>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => navigate('/admin/employers')}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
                theme === 'dark' ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-200 text-slate-800 hover:bg-slate-50',
              )}
            >
              {t('dashboard.admin.employers.delete.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-55',
                theme === 'dark'
                  ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-400/28'
                  : 'border-sky-400 bg-sky-600 text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)] hover:bg-sky-700',
              )}
            >
              {busy ? t('dashboard.admin.employers.create.submitting') : t('dashboard.admin.employers.create.submit')}
            </button>
          </div>
        </form>
      </DashboardSurface>
    </>
  )
}
