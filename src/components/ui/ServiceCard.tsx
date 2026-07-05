import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import clsx from 'clsx'
import ServiceIcon from '../icons/ServiceIcon'
import type { Service } from '../../data/content'

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const accent = service.accent === 'aqua' ? 'aqua' : 'ember'

  return (
    <Link
      to={`/services#${service.id}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-ink-950/8 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ink-950/15 hover:shadow-md"
    >
      <span
        className={clsx(
          'pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100',
          accent === 'ember' ? 'bg-ember-500/20' : 'bg-aqua-500/20',
          'opacity-0',
        )}
      />
      <div className="flex items-start justify-between">
        <div
          className={clsx(
            'flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset',
            accent === 'ember'
              ? 'bg-ember-500/10 text-ember-500 ring-ember-500/20'
              : 'bg-aqua-500/10 text-aqua-500 ring-aqua-500/20',
          )}
        >
          <ServiceIcon name={service.icon} className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <span className="font-display text-4xl font-black text-ink-950/5">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-ink-950">{service.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{service.short}</p>
      </div>

      <span
        className={clsx(
          'mt-auto inline-flex items-center gap-2 text-sm font-bold',
          accent === 'ember' ? 'text-ember-600' : 'text-aqua-600',
        )}
      >
        اعرف أكثر
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  )
}
