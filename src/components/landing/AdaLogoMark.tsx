type AdaLogoMarkProps = {
  className?: string
}

/**
 * Brand mark inspired by the selected "1" concept:
 * a classic monogram A with a dynamic arc.
 * Uses currentColor so parent theme tokens control light/dark contrast.
 */
export function AdaLogoMark({ className }: AdaLogoMarkProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <path
        d="M32 6 54 58h-10.5L32 30.2 20.5 58H10L32 6Z"
        fill="currentColor"
      />
      <path
        d="M32 17.8 41.8 40.8h-4.8L32 29.3l-5 11.5h-4.8L32 17.8Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M6.8 47.2C17.8 35.3 31.5 29.8 56.5 29.6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}
