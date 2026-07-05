import Container from './Container'

export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-40 sm:pt-48">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="bg-radial-ember pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-ember-500/10 blur-3xl" />
      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-ember-500/10 px-4 py-1.5 text-xs font-bold text-ember-600 ring-1 ring-inset ring-ember-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
            {eyebrow}
          </span>
          <h1 className="text-balance font-display text-4xl font-extrabold text-ink-950 sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="text-balance text-base leading-relaxed text-ink-500 sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}
