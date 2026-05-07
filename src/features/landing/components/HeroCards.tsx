import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'
import { IconStar } from './icons'

function ProgressRow({
  label,
  value,
  isDark,
}: {
  label: string
  value: number
  isDark: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center justify-between gap-3 text-xs ${
          isDark ? 'text-white/70' : 'text-slate-700'
        }`}
      >
        <span className="truncate">{label}</span>
        <span className={`tabular-nums ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{value}</span>
      </div>
      <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-sky-100'}`}>
        <div
          className="h-full rounded-full bg-[#14f1d9]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function HeroCards({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="relative mx-auto w-full max-w-xl lg:mx-0">
      <div
        className={`absolute -top-6 end-8 z-20 flex h-14 w-14 items-center justify-center rounded-full border text-lg font-semibold shadow-[0_0_40px_rgba(20,241,217,0.18)] backdrop-blur-md ${
          isDark
            ? 'border-white/15 bg-gradient-to-br from-white/15 to-white/5 text-white'
            : 'border-sky-200 bg-gradient-to-br from-white to-sky-100 text-slate-800'
        }`}
      >
        {t('landing.visual.avatarLetter')}
      </div>

      <div
        className={`relative z-10 translate-y-2 rounded-2xl border p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5 ${
          isDark ? 'border-white/10 bg-white/[0.06]' : 'border-sky-200 bg-white/90'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`font-display text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('landing.card.shifts.title')}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <ProgressRow
            label={t('landing.card.shifts.matching')}
            value={78}
            isDark={isDark}
          />
          <ProgressRow
            label={t('landing.card.shifts.application')}
            value={56}
            isDark={isDark}
          />
          <ProgressRow
            label={t('landing.card.shifts.approval')}
            value={42}
            isDark={isDark}
          />
        </div>
        <button
          type="button"
          onClick={onOpenLogin}
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-[#0ea5e9] transition hover:border-[#14f1d9]/35 hover:bg-[#14f1d9]/10 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-sky-200 bg-sky-50'
          }`}
        >
          <span className="truncate">
            {t('landing.card.shifts.cta', { count: 12 })}
          </span>
        </button>
      </div>

      <div
        className={`relative z-[9] -mt-6 ms-4 translate-y-4 rounded-2xl border p-4 shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:ms-8 sm:p-5 ${
          isDark ? 'border-white/10 bg-white/[0.05]' : 'border-sky-200 bg-white/90'
        }`}
      >
        <p className={`font-display text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('landing.card.activity.title')}
        </p>
        <div className="mt-4 flex items-end gap-2">
          {[40, 64, 48, 80, 56, 72].map((height) => (
            <div
              key={`activity-${height}`}
              className="w-2.5 rounded-full bg-gradient-to-t from-[#14f1d9]/15 to-[#14f1d9]"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-[#14f1d9]">
          {t('landing.card.activity.stat')}
        </p>
      </div>

      <div
        className={`relative z-[8] -mt-4 me-2 translate-y-6 rounded-2xl border p-4 shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:me-6 sm:p-5 ${
          isDark ? 'border-white/10 bg-white/[0.05]' : 'border-sky-200 bg-white/90'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`font-display text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('landing.card.suggestion.title')}
          </p>
          <div
            className="flex shrink-0 gap-0.5 text-[#14f1d9]"
            role="img"
            aria-label={t('landing.visual.ratingAria')}
          >
            {Array.from({ length: 5 }, (_, starIndex) => (
              <IconStar key={`star-${starIndex}`} className="h-4 w-4" />
            ))}
          </div>
        </div>
        <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-700'}`}>
          {t('landing.card.suggestion.body')}
        </p>
      </div>
    </div>
  )
}
