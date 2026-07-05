import { useState } from 'react'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

export default function FAQItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string
  answer: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border bg-white transition-colors',
        open ? 'border-ember-500/30 shadow-sm' : 'border-ink-950/8',
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
        aria-expanded={open}
      >
        <span className="font-display text-base font-bold text-ink-950 sm:text-lg">{question}</span>
        <span
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-500/10 text-ember-500 transition-transform duration-300',
            open && 'rotate-45 bg-ember-500 text-white',
          )}
        >
          <Plus className="h-4 w-4" />
        </span>
      </button>
      <div
        className={clsx(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm leading-relaxed text-ink-500 sm:text-base">{answer}</p>
        </div>
      </div>
    </div>
  )
}
