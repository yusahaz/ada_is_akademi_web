import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { adminManagementApi } from '../../../api/admin/admin-management'
import { DashboardHero, DashboardSurface, StatePanel } from '../../../shared/ui/ui-primitives'
import { cn } from '../../../shared/lib/cn'
import { useTheme } from '../../../theme/theme-context'
import { useNotification } from '../../../notifications/notification-context'

export function AdminUserCreatePage() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: notifyError } = useNotification()

  const inputClass = cn(
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 min-w-0',
    theme === 'dark'
      ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
  )

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

    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()
    const pw = password.trim()
    if (!em || !pw) {
      setFormError('E-posta ve şifre zorunludur.')
      return
    }

    setBusy(true)
    try {
      const systemUserId = await adminManagementApi.registerAdmin({
        email: em,
        password: pw,
        firstName: fn || null,
        lastName: ln || null,
        phone: phone.trim() || null,
      })
      success('İşlem başarılı')
      navigate(`/admin/users/${systemUserId}`, { replace: true })
    } catch {
      notifyError('İşlem sırasında bir hata oluştu')
    } finally {
      setBusy(false)
    }
  }

  const toneMuted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className={cn(
          'mb-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
          theme === 'dark'
            ? 'border-white/15 text-white hover:bg-white/10'
            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Listeye dön
      </button>

      <DashboardHero
        theme={theme}
        title="Yeni Kullanıcı Oluştur"
        description="Bu ekrandan yalnızca Admin tipi sistem kullanıcısı oluşturulur."
      />

      <DashboardSurface theme={theme}>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {formError ? <StatePanel theme={theme} text={formError} isError /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>Ad</span>
              <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>Soyad</span>
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>E-posta</span>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
            <label>
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>Telefon</span>
              <input type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </label>
            <label className="sm:col-span-2">
              <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${toneMuted}`}>Şifre</span>
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
              onClick={() => navigate('/admin/users')}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
                theme === 'dark'
                  ? 'border-white/15 text-white hover:bg-white/10'
                  : 'border-slate-200 text-slate-800 hover:bg-slate-50',
              )}
            >
              Vazgeç
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
              {busy ? 'Oluşturuluyor...' : 'Admin Kullanıcısı Oluştur'}
            </button>
          </div>
        </form>
      </DashboardSurface>
    </>
  )
}
