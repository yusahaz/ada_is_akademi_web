import { useTranslation } from 'react-i18next'

import { useTheme } from '../../theme/theme-context'
import { IconArrowRight, IconBolt, IconPlay } from './icons'
import { HeroBackground } from './HeroBackground'
import { HeroCards } from './HeroCards'

export function HeroSection({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden"
      aria-labelledby="hero-title"
    >
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="text-start">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ring-1 backdrop-blur-md sm:text-sm ${
                theme === 'dark'
                  ? 'border-[#14f1d9]/25 bg-[#14f1d9]/10 text-[#b7fff4] ring-[#14f1d9]/15'
                  : 'border-sky-200 bg-sky-100 text-sky-800 ring-sky-200'
              }`}
            >
              <IconBolt
                className={`h-4 w-4 ${theme === 'dark' ? 'text-[#14f1d9]' : 'text-sky-600'}`}
              />
              <span>{t('landing.hero.badge')}</span>
            </div>

            <h1
              id="hero-title"
              className={`font-display mt-6 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('landing.hero.title')}
            </h1>

            <p
              className={`mt-5 max-w-xl text-pretty text-base leading-relaxed sm:text-lg ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}
            >
              {t('landing.hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#14f1d9] px-5 text-sm font-semibold text-[#041014] shadow-[0_18px_60px_rgba(20,241,217,0.22)] transition hover:translate-y-[-1px] hover:bg-[#62ffee]"
              >
                <span>{t('landing.hero.ctaExplore')}</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
              <a
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition ${
                  theme === 'dark'
                    ? 'border-white/18 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                    : 'border-sky-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50'
                }`}
                href="#how-it-works"
              >
                <IconPlay
                  className={`h-4 w-4 ${theme === 'dark' ? 'text-[#14f1d9]' : 'text-sky-600'}`}
                />
                <span>{t('landing.hero.ctaHowItWorks')}</span>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none lg:justify-self-end">
            <div
              className={`relative rounded-[2rem] border p-[1px] ${
                theme === 'dark'
                  ? 'border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]'
                  : 'border-sky-200 bg-gradient-to-br from-white to-sky-50 shadow-[0_0_0_1px_rgba(14,116,144,0.08)_inset]'
              }`}
            >
              <div
                className={`rounded-[calc(2rem-1px)] p-5 sm:p-7 ${
                  theme === 'dark' ? 'bg-[#0b0e14]/40' : 'bg-white/80'
                }`}
              >
                <HeroCards onOpenLogin={onOpenLogin} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
