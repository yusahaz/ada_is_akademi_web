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
import { useTheme } from '../../theme/theme-context'
import { AdaLogoMark } from './AdaLogoMark'
import {
  IconCheck,
  IconChevronDown,
  IconGlobe,
  IconMoon,
  IconSun,
} from './icons'

type NavbarProps = {
  onAuthAction?: () => void
  authLabel?: string
}

export function Navbar({ onAuthAction, authLabel }: NavbarProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

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
        theme === 'dark'
          ? 'border-white/10 bg-[#0b0e14]/70'
          : 'border-slate-300/80 bg-white/75'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className={`flex items-center gap-3 text-start no-underline ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
          aria-label={t('landing.nav.logoAria')}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14f1d9]/15 ring-1 ring-[#14f1d9]/25">
            <AdaLogoMark className="h-7 w-7 text-[#14f1d9]" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
            {t('landing.nav.brand')}
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex h-10 items-center justify-center rounded-full border px-3 transition ${
              theme === 'dark'
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            aria-label={t('landing.nav.themeToggleAria')}
            title={t('landing.nav.themeToggle')}
          >
            {theme === 'dark' ? (
              <IconSun className="h-4 w-4 text-[#14f1d9]" />
            ) : (
              <IconMoon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          <div ref={containerRef} className="relative inline-flex">
            <button
              ref={triggerRef}
              type="button"
              id="language-select"
              className={`relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-transparent px-3 pe-9 text-start outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-[#14f1d9]/55 ${
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
                className="h-4 w-4 shrink-0 text-[#14f1d9]/90"
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
                className={`pointer-events-none absolute end-2 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 transition-transform duration-150 ${
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
                className={`absolute end-0 top-full z-[60] mt-2 max-h-[min(320px,calc(100svh-5rem))] min-w-[12.5rem] overflow-y-auto overscroll-contain rounded-2xl border py-2 backdrop-blur-xl ${
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

          {onAuthAction ? (
            <button
              type="button"
              className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition ${
                theme === 'dark'
                  ? 'border-white/20 text-white hover:border-white/35 hover:bg-white/5'
                  : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
              }`}
              onClick={onAuthAction}
            >
              {authLabel ?? t('landing.nav.login')}
            </button>
          ) : (
            <a
              className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition ${
                theme === 'dark'
                  ? 'border-white/20 text-white hover:border-white/35 hover:bg-white/5'
                  : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
              }`}
              href="#sign-in"
            >
              {authLabel ?? t('landing.nav.login')}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
