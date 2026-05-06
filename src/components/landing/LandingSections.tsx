import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

import { useTheme } from '../../theme/theme-context'
import { IconCheck, IconShield, IconSpark, IconUsers } from './icons'

function SectionFrame({
  id,
  title,
  subtitle,
  children,
  isDark,
}: {
  id?: string
  title: string
  subtitle: string
  children: ReactNode
  isDark: boolean
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className={`font-display text-2xl font-semibold tracking-tight sm:text-3xl ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h2>
        <p className={`mt-4 text-sm leading-relaxed sm:text-base ${isDark ? 'text-white/65' : 'text-slate-700'}`}>
          {subtitle}
        </p>
      </div>
      <div className="mt-8 sm:mt-10">{children}</div>
    </section>
  )
}

export function LandingSections({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const stats = [
    t('landing.stats.items.0'),
    t('landing.stats.items.1'),
    t('landing.stats.items.2'),
  ]

  const steps = [
    {
      title: t('landing.how.items.0.title'),
      body: t('landing.how.items.0.body'),
    },
    {
      title: t('landing.how.items.1.title'),
      body: t('landing.how.items.1.body'),
    },
    {
      title: t('landing.how.items.2.title'),
      body: t('landing.how.items.2.body'),
    },
  ]

  const features = [
    {
      icon: IconSpark,
      title: t('landing.features.items.0.title'),
      body: t('landing.features.items.0.body'),
    },
    {
      icon: IconShield,
      title: t('landing.features.items.1.title'),
      body: t('landing.features.items.1.body'),
    },
    {
      icon: IconUsers,
      title: t('landing.features.items.2.title'),
      body: t('landing.features.items.2.body'),
    },
  ]

  return (
    <>
      <section id="explore" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-2 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item}
              className={`rounded-2xl border px-4 py-4 text-center text-sm backdrop-blur-md ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-white/80'
                  : 'border-sky-200 bg-white/90 text-slate-800'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <SectionFrame
        id="how-it-works"
        title={t('landing.how.title')}
        subtitle={t('landing.how.subtitle')}
        isDark={isDark}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className={`rounded-3xl border p-5 backdrop-blur-xl ${
                isDark ? 'border-white/10 bg-white/[0.04]' : 'border-sky-200 bg-white/90'
              }`}
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#14f1d9]/15 text-sm font-semibold text-[#14f1d9]">
                {index + 1}
              </div>
              <h3 className={`font-display mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-700'}`}>
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame
        title={t('landing.features.title')}
        subtitle={t('landing.features.subtitle')}
        isDark={isDark}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`rounded-3xl border p-5 backdrop-blur-xl ${
                isDark
                  ? 'border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]'
                  : 'border-sky-200 bg-gradient-to-b from-white to-sky-50'
              }`}
            >
              <feature.icon className="h-6 w-6 text-[#14f1d9]" />
              <h3 className={`font-display mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {feature.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-700'}`}>
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </SectionFrame>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div
          className={`rounded-[2rem] border p-6 text-center backdrop-blur-xl sm:p-10 ${
            isDark ? 'border-white/10 bg-white/[0.05]' : 'border-sky-200 bg-white/90'
          }`}
        >
          <p className="text-sm font-medium text-[#14f1d9]">
            {t('landing.proof.caption')}
          </p>
          <blockquote
            className={`font-display mx-auto mt-4 max-w-3xl text-xl font-semibold leading-snug sm:text-2xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {t('landing.proof.quote')}
          </blockquote>
          <p className={`mt-4 text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
            {t('landing.proof.author')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div
          className={`rounded-[2rem] border p-6 text-center shadow-[0_20px_80px_rgba(20,241,217,0.14)] sm:p-10 ${
            isDark
              ? 'border-[#14f1d9]/25 bg-[radial-gradient(circle_at_top,rgba(20,241,217,0.18),rgba(20,241,217,0.04)_50%,transparent_90%)]'
              : 'border-sky-300 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),rgba(56,189,248,0.08)_55%,transparent_92%)]'
          }`}
        >
          <h3
            className={`font-display text-2xl font-semibold sm:text-3xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {t('landing.cta.title')}
          </h3>
          <p
            className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${
              isDark ? 'text-white/75' : 'text-slate-700'
            }`}
          >
            {t('landing.cta.subtitle')}
          </p>
          <button
            type="button"
            onClick={onOpenLogin}
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#14f1d9] px-5 text-sm font-semibold text-[#041014] transition hover:bg-[#62ffee]"
          >
            <IconCheck className="h-4 w-4" />
            <span>{t('landing.cta.action')}</span>
          </button>
        </div>
      </section>
    </>
  )
}
