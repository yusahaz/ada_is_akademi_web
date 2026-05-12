import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Check,
  Globe,
  LogOut,
  Moon,
  Sun,
  UserCircle2,
  UserRound,
} from 'lucide-react'

import type { AppLocale } from '../../i18n/languages'
import { SUPPORTED_LOCALES } from '../../i18n/languages'
import { useTheme } from '../../theme/theme-context'
import { cn } from '../lib/cn'

export type HeaderUserMenuTone = 'dark' | 'light'

export type HeaderUserMenuProps = {
  /** Visual tone, used to align colors with surrounding header surface. */
  tone: HeaderUserMenuTone
  /** Optional display name shown at the top of the popover. */
  userName?: string | null
  /** Optional secondary line (typically email) shown below the name. */
  userEmail?: string | null
  /** When provided, a `Profil` action linking to this path is rendered. */
  profileTo?: string
  /** When provided, a `Çıkış` action is rendered at the bottom. */
  onLogout?: () => void
  /** Aria-label for the trigger button. Defaults to the i18n value. */
  triggerAriaLabel?: string
  /** Override classes for the trigger button (size/color/border). */
  triggerClassName?: string
  /** When set, only these locales appear in the language list (e.g. admin panel: Turkish + English). */
  localeChoices?: readonly AppLocale[]
  /**
   * Side of the popover anchor. Defaults to `end` so the popover opens
   * toward the inline-end edge (RTL safe via logical positioning).
   */
  align?: 'start' | 'end'
}

/**
 * Shared post-login user menu rendered behind the header user icon.
 *
 * Exposes:
 * - Profile shortcut (optional)
 * - Theme switch (Dark / Light)
 * - Language switch (defaults to all `SUPPORTED_LOCALES`; override via `localeChoices`)
 * - Logout shortcut (optional)
 */
export function HeaderUserMenu({
  tone,
  userName,
  userEmail,
  profileTo,
  onLogout,
  triggerAriaLabel,
  triggerClassName,
  localeChoices,
  align = 'end',
}: HeaderUserMenuProps) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const popoverId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const effectiveLocales: readonly AppLocale[] =
    localeChoices && localeChoices.length > 0 ? localeChoices : SUPPORTED_LOCALES

  const activeLanguage: AppLocale =
    effectiveLocales.find((code) => i18n.language.startsWith(code)) ?? effectiveLocales[0] ?? 'tr'

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      const root = containerRef.current
      if (!root || root.contains(event.target as Node)) return
      close()
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [close, open])

  const handleLanguageSelect = useCallback(
    async (code: AppLocale) => {
      if (code === activeLanguage) return
      await i18n.changeLanguage(code)
    },
    [activeLanguage, i18n],
  )

  const isDark = tone === 'dark'

  const defaultTriggerClassName = cn(
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45',
    isDark
      ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]'
      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200/70',
    open && (isDark ? 'bg-white/[0.08]' : 'bg-slate-200/80'),
  )

  const popoverAlignmentClass = align === 'end' ? 'end-0' : 'start-0'

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={triggerAriaLabel ?? t('dashboard.userMenu.triggerAria')}
        onClick={toggle}
        className={cn(triggerClassName ?? defaultTriggerClassName)}
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={popoverId}
          role="menu"
          aria-label={t('dashboard.userMenu.title')}
          className={cn(
            'absolute top-full z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border shadow-[0_18px_44px_rgba(2,6,23,0.32)] backdrop-blur-xl',
            popoverAlignmentClass,
            isDark
              ? 'border-white/10 bg-[#0b0e14]/95 text-slate-100'
              : 'border-slate-200 bg-white/95 text-slate-800',
          )}
        >
          {(userName || userEmail) ? (
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                isDark ? 'border-b border-white/10' : 'border-b border-slate-200',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  isDark ? 'bg-cyan-300/15 text-cyan-200' : 'bg-sky-100 text-sky-700',
                )}
                aria-hidden="true"
              >
                <UserCircle2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                {userName ? (
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      isDark ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {userName}
                  </p>
                ) : null}
                {userEmail ? (
                  <p
                    className={cn(
                      'truncate text-xs',
                      isDark ? 'text-white/65' : 'text-slate-500',
                    )}
                  >
                    {userEmail}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {profileTo ? (
            <Link
              to={profileTo}
              role="menuitem"
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none',
                isDark
                  ? 'text-slate-100 hover:bg-white/[0.06] focus-visible:bg-white/[0.06]'
                  : 'text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100',
              )}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">
                {t('dashboard.userMenu.profile')}
              </span>
            </Link>
          ) : null}

          <SectionHeading
            tone={tone}
            icon={isDark || theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            label={t('dashboard.userMenu.theme')}
          />
          <div className="px-3 pb-2">
            <div
              role="group"
              aria-label={t('dashboard.userMenu.theme')}
              className={cn(
                'grid grid-cols-2 gap-1 rounded-xl p-1',
                isDark ? 'bg-white/5' : 'bg-slate-100',
              )}
            >
              <ThemeOptionButton
                tone={tone}
                isActive={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={<Sun className="h-4 w-4" />}
                label={t('dashboard.userMenu.themeLight')}
              />
              <ThemeOptionButton
                tone={tone}
                isActive={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={<Moon className="h-4 w-4" />}
                label={t('dashboard.userMenu.themeDark')}
              />
            </div>
          </div>

          <SectionHeading
            tone={tone}
            icon={<Globe className="h-3.5 w-3.5" />}
            label={t('dashboard.userMenu.language')}
          />
          <ul
            role="group"
            aria-label={t('dashboard.userMenu.language')}
            className="max-h-56 overflow-y-auto px-1 pb-2"
          >
            {effectiveLocales.map((code) => {
              const selected = code === activeLanguage
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => void handleLanguageSelect(code)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition focus-visible:outline-none',
                      isDark
                        ? 'hover:bg-white/[0.06] focus-visible:bg-white/[0.06]'
                        : 'hover:bg-slate-100 focus-visible:bg-slate-100',
                      selected
                        ? isDark
                          ? 'text-cyan-200'
                          : 'text-sky-700'
                        : isDark
                          ? 'text-slate-100'
                          : 'text-slate-700',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex w-7 shrink-0 justify-start text-xs font-semibold uppercase tracking-wider tabular-nums',
                        isDark ? 'text-white/55' : 'text-slate-500',
                      )}
                      aria-hidden="true"
                    >
                      {code}
                    </span>
                    <span className="min-w-0 flex-1 truncate leading-snug">
                      {t(`landing.lang.${code}`)}
                    </span>
                    {selected ? (
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isDark ? 'text-cyan-300' : 'text-sky-600',
                        )}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="inline-block h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {onLogout ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close()
                onLogout()
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none',
                isDark
                  ? 'border-t border-white/10 text-rose-200 hover:bg-rose-400/10 focus-visible:bg-rose-400/10'
                  : 'border-t border-slate-200 text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50',
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-start">
                {t('dashboard.userMenu.logout')}
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type SectionHeadingProps = {
  tone: HeaderUserMenuTone
  icon: ReactNode
  label: string
}

function SectionHeading({ tone, icon, label }: SectionHeadingProps) {
  const isDark = tone === 'dark'
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em]',
        isDark ? 'text-white/55' : 'text-slate-500',
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

type ThemeOptionButtonProps = {
  tone: HeaderUserMenuTone
  isActive: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}

function ThemeOptionButton({
  tone,
  isActive,
  onClick,
  icon,
  label,
}: ThemeOptionButtonProps) {
  const isDark = tone === 'dark'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45',
        isActive
          ? isDark
            ? 'bg-cyan-300/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/45'
            : 'bg-white text-slate-900 shadow-sm ring-1 ring-inset ring-sky-300'
          : isDark
            ? 'text-slate-200 hover:bg-white/[0.06]'
            : 'text-slate-600 hover:bg-white/70',
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
