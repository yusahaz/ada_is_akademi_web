import { Globe, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type AppTheme, useTheme } from '../../../../../theme/theme-context'
import { type TFn, type WorkerTone, resolveMuted, resolveTitle } from './helpers'

const LANGUAGE_OPTIONS = [
  { value: 'tr', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.tr' },
  { value: 'en', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.en' },
  { value: 'it', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.it' },
  { value: 'es', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.es' },
  { value: 'fr', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.fr' },
  { value: 'ru', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.ru' },
  { value: 'ar', labelKey: 'dashboard.workerPortal.profile.settingsSection.languages.ar' },
]

export function SettingsSection({ theme, t }: { theme: WorkerTone; t: TFn }) {
  const { i18n } = useTranslation()
  const { theme: appTheme, setTheme } = useTheme()
  const selectedLanguage = (i18n.resolvedLanguage || i18n.language || 'tr').split('-')[0]

  const baseInput =
    theme === 'dark'
      ? 'border-white/20 bg-white/[0.03] text-white'
      : 'border-slate-200 bg-white text-slate-900'

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className={`text-base font-semibold leading-tight sm:text-lg ${resolveTitle(theme)}`}>
          {t('dashboard.workerPortal.profile.settingsSection.title')}
        </p>
        <p className={`text-xs leading-relaxed sm:text-sm ${resolveMuted(theme)}`}>
          {t('dashboard.workerPortal.profile.settingsSection.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        <div
          className="rounded-2xl p-3 sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm ${resolveMuted(theme)}`}>
              <Globe className="h-4 w-4" aria-hidden />
              {t('dashboard.workerPortal.profile.settingsSection.languageLabel')}
            </span>
            <select
              value={selectedLanguage}
              onChange={(e) => void i18n.changeLanguage(e.target.value)}
              className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 sm:w-[16rem] ${baseInput}`}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="rounded-2xl p-3 sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm ${resolveMuted(theme)}`}>
              <Palette className="h-4 w-4" aria-hidden />
              {t('dashboard.workerPortal.profile.settingsSection.themeLabel')}
            </span>
            <select
              value={appTheme}
              onChange={(e) => setTheme(e.target.value as AppTheme)}
              className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 sm:w-[16rem] ${baseInput}`}
            >
              <option value="light">
                {t('dashboard.workerPortal.profile.settingsSection.themes.light')}
              </option>
              <option value="dark">
                {t('dashboard.workerPortal.profile.settingsSection.themes.dark')}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
