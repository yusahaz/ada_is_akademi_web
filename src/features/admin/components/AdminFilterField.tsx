import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

import { useTheme } from '../../../theme/theme-context'

type ThemeInputClassProps = {
  className?: string
}

function adminFilterInputClassName(theme: 'dark' | 'light', className?: string) {
  const base =
    theme === 'dark'
      ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
      : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
  return `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${base}${className ? ` ${className}` : ''}`
}

function adminFilterSelectClassName(theme: 'dark' | 'light', className?: string) {
  const base =
    theme === 'dark'
      ? 'border-white/15 bg-white/5 text-white focus:border-[#14f1d9]/55 focus:ring-2 focus:ring-[#14f1d9]/20'
      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
  return `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${base}${className ? ` ${className}` : ''}`
}

export function AdminFilterInput(
  props: InputHTMLAttributes<HTMLInputElement> & ThemeInputClassProps,
) {
  const { theme } = useTheme()
  const { className, ...rest } = props
  return <input {...rest} className={adminFilterInputClassName(theme, className)} />
}

export function AdminFilterSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & ThemeInputClassProps,
) {
  const { theme } = useTheme()
  const { className, ...rest } = props
  return <select {...rest} className={adminFilterSelectClassName(theme, className)} />
}
