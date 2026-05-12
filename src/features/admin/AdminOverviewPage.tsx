import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, Clock3, ShieldCheck, Users } from 'lucide-react'

import { getAdminSummaryStats, type AdminSummaryStats } from '../../api/admin/admin-dashboard'
import { StatePanel, DashboardHero, DashboardSurface } from '../../shared/ui/ui-primitives'
import { useTheme } from '../../theme/theme-context'
import { AdminCommissionRevenueChart } from './components/AdminCommissionRevenueChart'

export function AdminOverviewPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [stats, setStats] = useState<AdminSummaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    setLoading(true)
    void getAdminSummaryStats()
      .then((next) => {
        if (!isActive) return
        setStats(next)
        setError(null)
      })
      .catch(() => {
        if (!isActive) return
        setStats(null)
        setError(t('dashboard.admin.summary.fetchError'))
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [t])

  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'tr'
  const formatCount = (value: number | undefined) => (value ?? 0).toLocaleString(locale)

  const kpis = useMemo(() => {
    const overview = stats?.overview
    return [
      {
        title: t('dashboard.admin.cards.employers.title'),
        value: formatCount(overview?.activeEmployerCount),
        hint: `${t('dashboard.admin.cards.totalLabel')}: ${formatCount(overview?.totalEmployerCount)}`,
        icon: <BriefcaseBusiness className="h-5 w-5" />,
      },
      {
        title: t('dashboard.admin.cards.candidates.title'),
        value: formatCount(overview?.activeWorkerCount),
        hint: `${t('dashboard.admin.cards.totalLabel')}: ${formatCount(overview?.totalWorkerCount)}`,
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: t('dashboard.admin.cards.applications.title'),
        value: formatCount(overview?.pendingJobApplicationCount),
        hint: `${t('dashboard.admin.cards.totalLabel')}: ${formatCount(overview?.totalJobApplicationCount)}`,
        icon: <Clock3 className="h-5 w-5" />,
      },
      {
        title: t('dashboard.admin.cards.postings.title'),
        value: formatCount(overview?.openJobPostingCount),
        hint: `${t('dashboard.admin.cards.totalLabel')}: ${formatCount(overview?.totalJobPostingCount)}`,
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ]
  }, [stats, t, locale])

  return (
    <>
      <DashboardHero
        theme={theme}
        title={t('dashboard.admin.details.overview.title')}
        description={t('dashboard.admin.details.overview.body')}
      />

      {error ? <StatePanel theme={theme} text={error} isError /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <DashboardSurface key={item.title} theme={theme}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {loading ? '...' : item.value}
                </p>
                <p className={`mt-1 text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                  {item.title}
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  theme === 'dark' ? 'bg-white/10 text-cyan-200' : 'bg-sky-100 text-sky-700'
                }`}
              >
                {item.icon}
              </span>
            </div>
            <p className={`mt-3 text-xs ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>{item.hint}</p>
          </DashboardSurface>
        ))}
      </div>

      <AdminCommissionRevenueChart />
    </>
  )
}
