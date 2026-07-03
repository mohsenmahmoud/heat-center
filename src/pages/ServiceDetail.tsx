import { Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import Container from '../components/ui/Container'
import ServiceIcon from '../components/icons/ServiceIcon'
import { LinkButton } from '../components/ui/Button'
import { services } from '../data/content'

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const index = services.findIndex((s) => s.id === id)
  const service = services[index]

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const accent = service.accent === 'aqua' ? 'aqua' : 'ember'
  const prev = services[(index - 1 + services.length) % services.length]
  const next = services[(index + 1) % services.length]

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pb-16 pt-40 sm:pt-48">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="bg-radial-ember pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-ember-500/15 blur-3xl" />

        <Container className="relative">
          <nav className="mb-8 flex items-center justify-center gap-2 text-xs text-ink-400">
            <span>خدماتنا</span>
            <span>/</span>
            <span className="text-ink-200">{service.title}</span>
          </nav>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <span
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ring-1 ring-inset',
                accent === 'ember'
                  ? 'bg-ember-500/10 text-ember-400 ring-ember-500/20'
                  : 'bg-aqua-500/10 text-aqua-400 ring-aqua-500/20',
              )}
            >
              خدمة 0{index + 1} من {services.length}
            </span>
            <h1 className="text-balance font-display text-4xl font-extrabold text-white sm:text-5xl">
              {service.title}
            </h1>
            <p className="text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
              {service.short}
            </p>
          </div>
        </Container>
      </section>

      <section className="relative bg-ink-950 pb-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div
            className={clsx(
              'relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] border border-white/5',
              accent === 'ember'
                ? 'bg-gradient-to-br from-ember-950 via-ink-900 to-ink-950'
                : 'bg-gradient-to-br from-aqua-900 via-ink-900 to-ink-950',
            )}
          >
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
            <div
              className={clsx(
                'pointer-events-none absolute h-56 w-56 rounded-full blur-3xl',
                accent === 'ember' ? 'bg-ember-500/30' : 'bg-aqua-500/30',
              )}
            />
            <span
              className={clsx(
                'relative flex h-28 w-28 items-center justify-center rounded-3xl ring-1 ring-inset backdrop-blur',
                accent === 'ember'
                  ? 'bg-ember-500/10 text-ember-400 ring-ember-500/30'
                  : 'bg-aqua-500/10 text-aqua-400 ring-aqua-500/30',
              )}
            >
              <ServiceIcon name={service.icon} className="h-12 w-12" strokeWidth={1.5} />
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-ink-300">{service.description}</p>

            <ul className="flex flex-col gap-3">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-200">
                  <CheckCircle2
                    className={clsx(
                      'mt-0.5 h-5 w-5 shrink-0',
                      accent === 'ember' ? 'text-ember-500' : 'text-aqua-500',
                    )}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row">
              <LinkButton to="/contact">اطلب استشارة مجانية</LinkButton>
              <LinkButton to="/services" variant="secondary">
                كل الخدمات
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative border-t border-white/5 bg-ink-950 pb-24">
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
          <LinkButton
            to={`/services/${prev.id}`}
            variant="secondary"
            className="!justify-start sm:flex-1"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {prev.title}
          </LinkButton>
          <LinkButton
            to={`/services/${next.id}`}
            variant="secondary"
            className="!justify-end sm:flex-1"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            {next.title}
          </LinkButton>
        </Container>
      </section>
    </>
  )
}
