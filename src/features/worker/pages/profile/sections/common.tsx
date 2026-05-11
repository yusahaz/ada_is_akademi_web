import type { ReactNode } from 'react'

import { StatePanel } from '../../../../../shared/ui/ui-primitives'

import type { WorkerProfileSectionItem } from '../types'
import type { WorkerTone } from './helpers'
import { normalizeValue, resolveMuted, resolveTitle } from './helpers'

export function ProfileInput({
  theme,
  label,
  value,
  onChange,
}: {
  theme: WorkerTone
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className={resolveMuted(theme)}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-w-0 w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
      />
    </label>
  )
}

export function ProfileReadOnlyField({
  theme,
  label,
  value,
}: {
  theme: WorkerTone
  label: string
  value: string
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className={resolveMuted(theme)}>{label}</p>
      <p
        className={`min-w-0 rounded-xl border px-3 py-2 leading-snug [overflow-wrap:anywhere] ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function EditableListSection({
  title,
  items,
  theme,
  onRemove,
  form,
}: {
  title: string
  items: WorkerProfileSectionItem[]
  theme: WorkerTone
  onRemove: (id: string) => void
  form: ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold ${resolveTitle(theme)}`}>{title}</h3>
      {form}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.length === 0 ? (
          <StatePanel text="-" theme={theme} />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/80' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={resolveTitle(theme)}>{normalizeValue(item.label, () => '-')}</p>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className={theme === 'dark' ? 'text-rose-200' : 'text-rose-700'}
                >
                  ×
                </button>
              </div>
              <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>{item.value}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
