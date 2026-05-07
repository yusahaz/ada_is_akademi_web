import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../theme/theme-context'

export function HeroBackground() {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(ellipse_at_20%_0%,rgba(20,241,217,0.18),transparent_55%),radial-gradient(ellipse_at_80%_30%,rgba(99,102,241,0.16),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(20,241,217,0.08),transparent_45%)]'
            : 'bg-[radial-gradient(ellipse_at_20%_0%,rgba(6,182,212,0.18),transparent_55%),radial-gradient(ellipse_at_80%_30%,rgba(59,130,246,0.16),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(14,165,233,0.1),transparent_45%)]'
        }`}
      />
      <svg
        className={`absolute inset-0 h-full w-full ${theme === 'dark' ? 'opacity-[0.35]' : 'opacity-[0.45]'}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(12,74,110,0.10)'}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div
        className={`absolute -start-24 top-24 h-72 w-72 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-[#14f1d9]/15' : 'bg-cyan-300/30'
        }`}
      />
      <div
        className={`absolute -end-16 bottom-10 h-80 w-80 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-indigo-500/20' : 'bg-sky-300/30'
        }`}
      />
      <svg
        className={`absolute start-1/2 top-1/2 h-[min(920px,140vw)] w-[min(920px,140vw)] -translate-x-1/2 -translate-y-1/2 ${
          theme === 'dark' ? 'text-[#14f1d9]/35' : 'text-sky-500/45'
        }`}
        viewBox="0 0 800 800"
        role="img"
        aria-label={t('landing.hero.decorativeAria')}
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="400" cy="400" r="120" opacity="0.55" />
          <circle cx="400" cy="400" r="220" opacity="0.35" />
          <circle cx="400" cy="400" r="320" opacity="0.2" />
          <path d="M400 120 560 260 520 460 280 520 160 340Z" opacity="0.45" />
          <path d="M120 520 260 360 460 300 640 420 520 640Z" opacity="0.25" />
        </g>
        <g fill="currentColor">
          <circle cx="400" cy="280" r="5" />
          <circle cx="520" cy="360" r="4" />
          <circle cx="300" cy="420" r="4" />
          <circle cx="470" cy="520" r="5" />
          <circle cx="260" cy="300" r="3" />
          <circle cx="560" cy="520" r="3" />
        </g>
      </svg>
    </div>
  )
}
