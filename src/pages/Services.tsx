import { CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceIcon from '../components/icons/ServiceIcon'
import { LinkButton } from '../components/ui/Button'
import { services } from '../data/content'

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="خدماتنا"
        title="منظومة متكاملة من حلول التدفئة والتسخين"
        description="من الاستشارة الأولى وحتى الصيانة الدورية، نغطي كل احتياجاتك فى التدفئة المركزية وتسخين المياه بمعدات أوروبية أصلية وفريق هندسي متخصص."
        image={{ src: '/images/pages/services.svg', alt: 'خدمات هيت سنتر' }}
      />

      <section className="relative bg-ink-950 pb-24">
        <Container className="flex flex-col gap-24">
          {services.map((service, i) => {
            const accent = service.accent === 'aqua' ? 'aqua' : 'ember'
            const reversed = i % 2 === 1

            return (
              <div
                key={service.id}
                id={service.id}
                className="grid scroll-mt-28 gap-10 lg:grid-cols-2 lg:items-center"
              >
                <div className={clsx(reversed && 'lg:order-2')}>
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
                </div>

                <div className={clsx('flex flex-col gap-5', reversed && 'lg:order-1')}>
                  <span
                    className={clsx(
                      'inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ring-1 ring-inset',
                      accent === 'ember'
                        ? 'bg-ember-500/10 text-ember-400 ring-ember-500/20'
                        : 'bg-aqua-500/10 text-aqua-400 ring-aqua-500/20',
                    )}
                  >
                    خدمة 0{i + 1}
                  </span>
                  <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                    {service.title}
                  </h2>
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

                  <div className="mt-2">
                    <LinkButton to="/contact">اطلب استشارة مجانية</LinkButton>
                  </div>
                </div>
              </div>
            )
          })}
        </Container>
      </section>
    </>
  )
}
