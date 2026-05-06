type AdaLogoWordmarkProps = {
  className?: string
  mode?: 'dark' | 'light'
}

/**
 * Shared written logo lockup (mark + "Ada İş Akademi") in SVG format.
 * Keeps the same concept as AdaLogoMark and is intended for project-wide use.
 */
export function AdaLogoWordmark({ className, mode = 'light' }: AdaLogoWordmarkProps) {
  const main = mode === 'dark' ? '#E2E8F0' : '#0B2A66'
  const cut = mode === 'dark' ? '#0F172A' : '#FFFFFF'
  const text = mode === 'dark' ? '#E2E8F0' : '#0F172A'
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 64"
      fill="none"
      aria-hidden
    >
      <path d="M32 6 54 58h-10.5L32 30.2 20.5 58H10L32 6Z" fill={main} />
      <path d="M32 17.8 41.8 40.8h-4.8L32 29.3l-5 11.5h-4.8L32 17.8Z" fill={cut} fillOpacity="0.92" />
      <path d="M6.8 47.2C17.8 35.3 31.5 29.8 56.5 29.6" stroke={main} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <text x="78" y="42" fill={text} fontFamily="Syne, system-ui, sans-serif" fontSize="26" fontWeight="700" letterSpacing="0.2">
        Ada İş Akademi
      </text>
    </svg>
  )
}
