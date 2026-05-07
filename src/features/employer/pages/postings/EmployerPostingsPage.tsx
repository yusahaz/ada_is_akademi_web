import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DashboardSurface } from '../../../../shared/ui/ui-primitives'
import { useTheme } from '../../../../theme/theme-context'
import { WorkerSectionHeader } from '../../../worker/worker-ui'
import { useEmployerPortal } from '../../portal/use-employer-portal'
import { PostingDetailPanel, PostingsFilters, PostingsList } from './sections'

export function EmployerPostingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { filteredPostings, postingsFilter, setPostingsFilter, selectedPosting, setSelectedPostingId } =
    useEmployerPortal()
  const toneClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600'

  return (
    <>
      <WorkerSectionHeader
        tone={theme}
        title={t('dashboard.employerPortal.pages.postings.title')}
        subtitle={t('dashboard.employerPortal.pages.postings.subtitle')}
      />
      <DashboardSurface theme={theme}>
        <PostingsFilters theme={theme} postingsFilter={postingsFilter} setPostingsFilter={setPostingsFilter} onCreate={() => navigate('/employer/postings/create')} t={t} />
        <PostingsList theme={theme} toneClass={toneClass} filteredPostings={filteredPostings} setSelectedPostingId={setSelectedPostingId} t={t} />
        <PostingDetailPanel theme={theme} toneClass={toneClass} selectedPosting={selectedPosting} t={t} />
      </DashboardSurface>
    </>
  )
}
