import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DashboardSurface, InteractiveButton } from '../../../components/dashboard/ui-primitives'
import { useTheme } from '../../../theme/theme-context'
import { WorkerSectionHeader } from '../../worker/worker-ui'
import { useEmployerPortal } from '../use-employer-portal'

export function EmployerPostingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { filteredPostings, postingsFilter, setPostingsFilter, selectedPosting, setSelectedPostingId } =
    useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const sectionButtonClass = (isActiveButton: boolean) => `inline-flex ${isActiveButton ? 'is-active' : ''}`

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.postings.title')}
        subtitle={t('dashboard.employerPortal.pages.postings.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', t('dashboard.employer.postings.filters.all')],
                ['open', t('dashboard.employer.postings.filters.open')],
                ['draft', t('dashboard.employer.postings.filters.draft')],
                ['completed', t('dashboard.employer.postings.filters.completed')],
              ] as ['all' | 'open' | 'draft' | 'completed', string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={sectionButtonClass(postingsFilter === key)}
                onClick={() => setPostingsFilter(key)}
              >
                <InteractiveButton theme={theme} isActive={postingsFilter === key}>
                  {label}
                </InteractiveButton>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/employer/postings/create')}>
            <InteractiveButton theme={theme} isActive>
              {t('dashboard.employerSpot.operations.tabs.createPosting')}
            </InteractiveButton>
          </button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filteredPostings.length === 0 ? (
            <p className={`text-sm ${toneClass}`}>{t('dashboard.employer.postings.empty')}</p>
          ) : (
            filteredPostings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPostingId(item.id)}
                className={`rounded-2xl border px-3 py-3 text-start transition hover:-translate-y-0.5 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                <p className={`mt-1 text-xs ${toneClass}`}>
                  {item.shiftDate} • {item.shiftStartTime} - {item.shiftEndTime}
                </p>
                <p className={`mt-2 text-xs ${toneClass}`}>
                  {item.isPlanned
                    ? t('dashboard.employer.postings.mode.planned')
                    : t('dashboard.employer.postings.mode.instant')}
                </p>
              </button>
            ))
          )}
        </div>
        {selectedPosting ? (
          <div
            className={`mt-4 rounded-xl border p-3 ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('dashboard.employer.postings.detailTitle')}
            </p>
            <p className={`mt-2 text-xs ${toneClass}`}>{selectedPosting.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <span className={toneClass}>
                {t('dashboard.employer.postings.detail.pending')}: {selectedPosting.pendingApplications}
              </span>
              <span className={toneClass}>
                {t('dashboard.employer.postings.detail.accepted')}: {selectedPosting.acceptedApplications}
              </span>
              <span className={toneClass}>
                {t('dashboard.employer.postings.detail.headCount')}: {selectedPosting.headCount}
              </span>
              <span className={toneClass}>
                {t('dashboard.employer.postings.detail.status')}: {selectedPosting.status}
              </span>
            </div>
          </div>
        ) : (
          <p className={`mt-4 text-xs ${toneClass}`}>{t('dashboard.employer.fallback.readOnlyData')}</p>
        )}
      </DashboardSurface>
    </>
  )
}
