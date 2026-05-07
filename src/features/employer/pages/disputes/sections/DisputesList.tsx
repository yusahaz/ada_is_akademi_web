type DisputeItem = {
  id: number | string
  title: string
  detail: string
  severity: 'warning' | 'danger'
}

export function DisputesList({
  theme,
  disputes,
}: {
  theme: 'dark' | 'light'
  disputes: DisputeItem[]
}) {
  return (
    <div className="mt-4 space-y-2">
      {disputes.map((item) => {
        const tone = item.severity === 'danger'
          ? theme === 'dark'
            ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
            : 'border-rose-300 bg-rose-50 text-rose-900'
          : theme === 'dark'
            ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
            : 'border-amber-300 bg-amber-50 text-amber-900'
        return (
          <div key={String(item.id)} className={`rounded-xl border px-3 py-2 ${tone}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold">{item.title}</p>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold dark:bg-white/10">
                #{item.id}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-90">{item.detail}</p>
          </div>
        )
      })}
    </div>
  )
}
