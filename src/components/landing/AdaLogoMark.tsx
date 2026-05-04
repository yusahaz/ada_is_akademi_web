type AdaLogoMarkProps = {
  className?: string
}

/**
 * Brand mark for Ada İş Akademi: stylized “A” with academy roof cue and connection nodes.
 * Uses currentColor for the strokes/fills so it can inherit theme tokens.
 */
export function AdaLogoMark({ className }: AdaLogoMarkProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M9.5 15.5 20 7.5 30.5 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 32 20 12 28.75 32"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.75 23.25H25.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="14.75" cy="23.25" r="1.85" fill="currentColor" />
      <circle cx="25.25" cy="23.25" r="1.85" fill="currentColor" />
      <path
        d="M14.75 23.25H20V29"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  )
}
