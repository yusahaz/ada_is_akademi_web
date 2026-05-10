import type { ReactNode } from 'react'
import { Clock, MapPin, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { WorkerTone, WorkerEmphasis } from '../../../worker-ui'
import { WorkerGhostButton, WorkerPillBadge, WorkerPrimaryButton } from '../../../worker-ui'
import { cn } from '../../../../../shared/lib/cn'

export type WorkerPostingListItemProps = {
  theme: WorkerTone
  postingId: number
  title: string
  employerName?: string | null
  locationText?: string | null
  scheduleText: string
  wageText?: string | null
  metaText?: string | null
  distanceText?: string | null
  tags?: string[]
  leading?: ReactNode
  trailingBadgeText?: string | null
  trailingBadgeEmphasis?: WorkerEmphasis
  primaryActionLabel?: string
  primaryActionDisabled?: boolean
  onPrimaryAction?: () => void
}

export function WorkerPostingListItem({
  theme,
  postingId,
  title,
  employerName,
  locationText,
  scheduleText,
  wageText,
  metaText,
  distanceText,
  tags,
  leading,
  trailingBadgeText,
  trailingBadgeEmphasis = 'info',
  primaryActionLabel,
  primaryActionDisabled,
  onPrimaryAction,
}: WorkerPostingListItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const chipCls =
    theme === 'dark'
      ? 'rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/75'
      : 'rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600'

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-3 text-xs sm:p-4',
        theme === 'dark'
          ? 'border-white/10 bg-white/[0.03] text-white/75'
          : 'border-slate-200 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('line-clamp-2 text-sm font-semibold leading-snug sm:text-[15px]', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {title}
          </p>
          {employerName ? (
            <p className={cn('mt-1 text-[11px]', theme === 'dark' ? 'text-white/55' : 'text-slate-600')}>
              {employerName}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-end">
          {wageText ? (
            <span className={cn('text-sm font-semibold tabular-nums', theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700')}>
              {wageText}
            </span>
          ) : null}
          {trailingBadgeText ? (
            <div className="mt-1">
              <WorkerPillBadge tone={theme} emphasis={trailingBadgeEmphasis}>
                {trailingBadgeText}
              </WorkerPillBadge>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {locationText ? (
          <p className={cn('flex items-start gap-2 text-[11px] leading-snug', theme === 'dark' ? 'text-white/70' : 'text-slate-600')}>
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span>{locationText}</span>
          </p>
        ) : null}

        <p className={cn('flex items-start gap-2 text-[11px] leading-snug', theme === 'dark' ? 'text-white/65' : 'text-slate-600')}>
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span>{scheduleText}</span>
        </p>
      </div>

      {metaText ? (
        <p className={cn('flex items-center gap-2 text-[11px]', theme === 'dark' ? 'text-white/55' : 'text-slate-500')}>
          <Users className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span>{metaText}</span>
        </p>
      ) : null}

      {leading ? <div>{leading}</div> : null}

      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 6).map((tag) => (
            <span key={`${postingId}-${tag}`} className={chipCls}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {distanceText ? (
        <span className={cn('text-[11px]', theme === 'dark' ? 'text-white/45' : 'text-slate-500')}>{distanceText}</span>
      ) : null}

      <div
        className={cn(
          'mt-1 flex flex-col gap-2 border-t pt-3 sm:flex-row',
          theme === 'dark' ? 'border-white/10' : 'border-slate-200',
        )}
      >
        {primaryActionLabel && onPrimaryAction ? (
          <WorkerPrimaryButton
            tone={theme}
            className="h-9 w-full px-3 py-1 text-xs sm:w-auto"
            disabled={primaryActionDisabled}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </WorkerPrimaryButton>
        ) : null}
        <WorkerGhostButton
          tone={theme}
          className="h-9 w-full px-3 py-1 text-xs sm:w-auto"
          onClick={() => navigate(`/worker/jobs/${postingId}`)}
        >
          {t('dashboard.workerPortal.tabs.jobs.actions.viewDetails')}
        </WorkerGhostButton>
      </div>
    </article>
  )
}
