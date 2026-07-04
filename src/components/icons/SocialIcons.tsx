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

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12.03 3c-4.97 0-9 4.03-9 9 0 1.6.42 3.13 1.22 4.47L3 21l4.65-1.22A8.96 8.96 0 0 0 12.03 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Z"
        fill="currentColor"
      />
      <path
        d="M9.1 7.6c-.2-.45-.42-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.28 0 1.35.98 2.65 1.12 2.83.14.18 1.9 3.04 4.68 4.14 2.31.91 2.78.73 3.28.68.5-.05 1.6-.65 1.83-1.29.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.53-.32-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.18-1.35-.8-.72-1.35-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.6-1.5-.86-2.05Z"
        fill="#fff"
      />
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
