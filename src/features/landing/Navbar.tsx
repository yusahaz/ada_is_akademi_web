import type { KeyboardEvent } from 'react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import type { AppLocale } from '../../i18n/languages'
import { SUPPORTED_LOCALES } from '../../i18n/languages'
import { useAuth } from '../auth/auth-context'
import { useTheme } from '../../theme/theme-context'
import { HeaderUserMenu } from '../../shared/ui/HeaderUserMenu'
import { AdaLogoWordmark } from './components/brand/AdaLogoWordmark'
import {
  IconCheck,
  IconChevronDown,
  IconGlobe,
  IconLogout,
  IconMoon,
  IconSun,
} from './components/icons'

type NavbarProps = {
  onAuthAction?: () => void
  authLabel?: string
  onSidebarToggle?: () => void
  showSidebarToggle?: boolean
}

export function Navbar({
  onAuthAction,
  authLabel,
  onSidebarToggle,
  showSidebarToggle = false,
}: NavbarProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, session } = useAuth()

  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const activeLanguage: AppLocale =
    SUPPORTED_LOCALES.find((code) => i18n.language.startsWith(code)) ?? 'tr'

  const activeIdx = Math.max(
    0,
    SUPPORTED_LOCALES.indexOf(activeLanguage),
  )

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const selectLocale = useCallback(
    async (code: AppLocale) => {
      await i18n.changeLanguage(code)
      closeMenu()
      triggerRef.current?.focus()
    },
    [closeMenu, i18n],
  )

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: MouseEvent) {
      const root = containerRef.current
      if (!root || root.contains(event.target as Node)) return
      closeMenu()
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [closeMenu, menuOpen])

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      return
    }
    if (event.key === 'Tab') {
      closeMenu()
      return
    }

    if (!menuOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setMenuOpen(true)
        setHighlightIndex(
          Math.min(activeIdx + 1, SUPPORTED_LOCALES.length - 1),
        )
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setMenuOpen(true)
        setHighlightIndex(Math.max(activeIdx - 1, 0))
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setMenuOpen(true)
        setHighlightIndex(activeIdx)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((i) =>
        Math.min(SUPPORTED_LOCALES.length - 1, i + 1),
      )
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((i) => Math.max(0, i - 1))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setHighlightIndex(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setHighlightIndex(SUPPORTED_LOCALES.length - 1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const code = SUPPORTED_LOCALES[highlightIndex]
      if (code) void selectLocale(code)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        showSidebarToggle
          ? theme === 'dark'
            ? 'border-cyan-300/20 bg-[linear-gradient(180deg,#0f1f35_0%,#102743_100%)]'
            : 'border-sky-300/60 bg-[linear-gradient(180deg,#dbe7f3_0%,#cedbea_100%)]'
          : theme === 'dark'
            ? 'border-white/10 bg-[#0b0e14]/70'
            : 'border-slate-300/80 bg-white/75'
      }`}
    >
      <div className="mx-auto flex w-full flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-3">
          <a
            href="#top"
            className={`flex min-w-0 items-center gap-3 text-start no-underline ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
            aria-label={t('landing.nav.logoAria')}
          >
            <AdaLogoWordmark
              className="h-7 w-[124px] shrink-0 sm:h-10 sm:w-[210px]"
              mode={theme === 'dark' ? 'dark' : 'light'}
            />
          </a>

          {showSidebarToggle ? (
            <button
              type="button"
              onClick={onSidebarToggle}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition sm:h-10 sm:w-10 ${
                theme === 'dark'
                  ? 'text-cyan-100 hover:bg-white/12'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
              aria-label="Sidebar aç/kapat"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition sm:h-10 sm:w-auto sm:px-3 ${
              theme === 'dark'
                ? 'text-white hover:bg-white/10'
                : 'text-slate-700 hover:bg-slate-100'
            } ${showSidebarToggle ? 'hidden' : ''}`}
            aria-label={t('landing.nav.themeToggleAria')}
            title={t('landing.nav.themeToggle')}
          >
            {theme === 'dark' ? (
              <IconSun className="h-4 w-4 text-[#14f1d9]" />
            ) : (
              <IconMoon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          <div
            ref={containerRef}
            className={`relative inline-flex ${showSidebarToggle ? 'hidden' : ''}`}
          >
            <button
              ref={triggerRef}
              type="button"
              id="language-select"
              className={`relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-2 pe-6 text-start outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-[#14f1d9]/55 sm:h-10 sm:gap-2 sm:px-3 sm:pe-9 ${
                theme === 'dark'
                  ? 'ring-offset-[#0b0e14] hover:bg-white/[0.06] text-white'
                  : 'ring-offset-white hover:bg-slate-200/70 text-slate-900'
              } ${
                menuOpen
                  ? theme === 'dark'
                    ? 'bg-white/[0.08]'
                    : 'bg-slate-200/80'
                  : ''
              }`}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? listboxId : undefined}
              aria-label={t('landing.nav.languageAria')}
              aria-activedescendant={
                menuOpen
                  ? `language-option-${SUPPORTED_LOCALES[highlightIndex]}`
                  : undefined
              }
              onClick={() => {
                setMenuOpen((open) => {
                  if (!open) {
                    setHighlightIndex(activeIdx)
                  }
                  return !open
                })
              }}
              onKeyDown={onTriggerKeyDown}
            >
              <IconGlobe
                className="hidden h-4 w-4 shrink-0 text-[#14f1d9]/90 sm:inline-block"
                aria-hidden
              />
              <span
                className={`min-w-[2.25ch] text-center text-xs font-semibold tracking-wider tabular-nums ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}
              >
                {activeLanguage.toUpperCase()}
              </span>
              <IconChevronDown
                className={`pointer-events-none absolute end-1.5 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 transition-transform duration-150 sm:end-2 ${
                  theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                } ${
                  menuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>

            {menuOpen ? (
              <ul
                id={listboxId}
                role="listbox"
                aria-label={t('landing.nav.languageAria')}
                className={`absolute end-0 top-full z-[60] mt-2 max-h-[min(320px,calc(100svh-5rem))] min-w-[11.5rem] max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-2xl border py-2 backdrop-blur-xl sm:min-w-[12.5rem] ${
                  theme === 'dark'
                    ? 'border-white/12 bg-[#0b0e14]/96 shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-[#14f1d9]/15'
                    : 'border-slate-300 bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.16)]'
                }`}
              >
                {SUPPORTED_LOCALES.map((code, idx) => {
                  const selected = code === activeLanguage
                  const highlighted = idx === highlightIndex
                  const label = t(`landing.lang.${code}`)

                  return (
                    <li key={code} role="presentation">
                      <button
                        type="button"
                        role="option"
                        id={`language-option-${code}`}
                        aria-selected={selected}
                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm transition focus-visible:outline-none ${
                          theme === 'dark'
                            ? 'hover:bg-white/[0.07] focus-visible:bg-white/[0.07]'
                            : 'hover:bg-slate-100 focus-visible:bg-slate-100'
                        } ${
                          highlighted
                            ? theme === 'dark'
                              ? 'bg-white/[0.07] ring-1 ring-inset ring-[#14f1d9]/35'
                              : 'bg-slate-100 ring-1 ring-inset ring-slate-300'
                            : ''
                        } ${
                          selected
                            ? theme === 'dark'
                              ? 'text-[#14f1d9]'
                              : 'text-sky-700'
                            : theme === 'dark'
                              ? 'text-white/92'
                              : 'text-slate-700'
                        }`}
                        tabIndex={-1}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => void selectLocale(code)}
                      >
                        <span
                          className={`w-7 shrink-0 text-xs font-semibold tracking-wider tabular-nums ${
                            theme === 'dark' ? 'text-white/55' : 'text-slate-500'
                          }`}
                        >
                          {code.toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 leading-snug">
                          {label}
                        </span>
                        {selected ? (
                          <IconCheck
                            className={`h-4 w-4 shrink-0 ${
                              theme === 'dark' ? 'text-[#14f1d9]' : 'text-sky-700'
                            }`}
                            aria-hidden
                          />
                        ) : (
                          <span className="inline-block h-4 w-4 shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          {showSidebarToggle && isAuthenticated && onAuthAction ? (
            <HeaderUserMenu
              tone={theme}
              userName={session?.email ?? null}
              userEmail={session?.email ?? null}
              onLogout={onAuthAction}
              align={i18n.dir() === 'rtl' ? 'start' : 'end'}
            />
          ) : onAuthAction ? (
            <button
              type="button"
              className={`inline-flex h-9 shrink-0 max-w-[7.5rem] items-center justify-center rounded-xl px-2.5 text-xs font-semibold transition sm:h-11 sm:max-w-none sm:px-4 sm:text-sm ${
                showSidebarToggle
                  ? theme === 'dark'
                    ? 'text-cyan-100 hover:bg-white/10'
                    : 'text-slate-700 hover:bg-white/50'
                  : theme === 'dark'
                    ? 'border border-white/20 text-white hover:border-white/35 hover:bg-white/5'
                    : 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
              } ${showSidebarToggle ? 'hidden sm:inline-flex' : ''}`}
              onClick={onAuthAction}
              aria-label={authLabel ?? t('landing.nav.login')}
              title={authLabel ?? t('landing.nav.login')}
            >
              {showSidebarToggle ? (
                <IconLogout className="h-5 w-5" />
              ) : (
                <span className="truncate">{authLabel ?? t('landing.nav.login')}</span>
              )}
            </button>
          ) : (
            <a
              className={`inline-flex h-9 shrink-0 max-w-[7.5rem] items-center justify-center rounded-xl border px-2.5 text-xs font-semibold transition sm:h-11 sm:max-w-none sm:px-4 sm:text-sm ${
                theme === 'dark'
                  ? 'border-white/20 text-white hover:border-white/35 hover:bg-white/5'
                  : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
              }`}
              href="#sign-in"
            >
              <span className="truncate">{authLabel ?? t('landing.nav.login')}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
