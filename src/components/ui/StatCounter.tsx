import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function StatCounter({
  value,
  suffix = '',
  label,
  tone = 'light',
}: {
  value: number
  suffix?: string
  label: string
  tone?: 'light' | 'dark'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <span
        className={`font-display text-4xl font-extrabold tabular-nums sm:text-5xl ${
          tone === 'light' ? 'text-ink-950' : 'text-white'
        }`}
      >
        {display}
        <span className="text-ember-500">{suffix}</span>
      </span>
      <span className={`text-sm font-medium ${tone === 'light' ? 'text-ink-500' : 'text-ink-300'}`}>
        {label}
      </span>
    </div>
  )
}
