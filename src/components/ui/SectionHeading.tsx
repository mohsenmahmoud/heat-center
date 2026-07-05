import clsx from 'clsx'

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'right'
  tone?: 'light' | 'dark'
}) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-right',
      )}
    >
      {eyebrow && (
        <span
          className={clsx(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide',
            tone === 'light'
              ? 'bg-ember-500/10 text-ember-600 ring-1 ring-inset ring-ember-500/20'
              : 'bg-ember-950/60 text-ember-300 ring-1 ring-inset ring-ember-500/20',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          'text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl',
          tone === 'light' ? 'text-ink-950' : 'text-white',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            'max-w-2xl text-balance text-base leading-relaxed sm:text-lg',
            tone === 'light' ? 'text-ink-500' : 'text-ink-300',
            align === 'center' ? 'mx-auto' : '',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
