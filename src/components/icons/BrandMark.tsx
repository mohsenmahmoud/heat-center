export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="brandFlame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFA366" />
          <stop offset="0.55" stopColor="#F2540E" />
          <stop offset="1" stopColor="#8A2404" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#0A121C" />
      <rect width="64" height="64" rx="18" fill="url(#brandFlame)" fillOpacity="0.08" />
      <path
        d="M32 10c-2 7-9 10-9 18a9 9 0 0 0 18 0c0-3-1.5-5-3-7 .3 3-1 4.5-2.5 5.5.8-4-1.5-8-3.5-16.5Z"
        fill="url(#brandFlame)"
      />
    </svg>
  )
}
