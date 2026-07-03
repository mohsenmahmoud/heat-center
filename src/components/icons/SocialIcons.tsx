type IconProps = { className?: string }

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15 8.5h2V5.6c-.35-.05-1.54-.15-2.94-.15-2.9 0-4.9 1.77-4.9 5.02V13H6.5v3.25h2.66V22h3.36v-5.75h2.55l.4-3.25h-2.95V10.9c0-.94.26-1.6 1.48-1.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="8.2" r="1.15" fill="currentColor" />
      <path d="M8 11v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M12 17v-3.2c0-1.4.9-2.3 2.1-2.3 1.2 0 1.9.85 1.9 2.3V17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
