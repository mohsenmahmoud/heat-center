import { CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceIcon from '../components/icons/ServiceIcon'
import { LinkButton } from '../components/ui/Button'
import { serviceCategories } from '../data/content'

export default function Services() {
  let serviceIndex = 0

  return (
    <>
      <PageHero
        eyebrow="خدماتنا"
        title="منظومة متكاملة من حلول التدفئة والتسخين"
        description="من الاستشارة الأولى وحتى الصيانة الدورية، نغطي كل احتياجاتك فى التدفئة المركزية وتسخين المياه بمعدات أوروبية أصلية وفريق هندسي متخصص."
      />

      <section className="relative bg-white pb-24">
        <Container className="flex flex-col gap-28">
          {serviceCategories.map((category) => {
            const isGroup = category.subServices.length > 1
            const categoryAccent = category.accent === 'aqua' ? 'aqua' : 'ember'

            return (
              <div key={category.id} className="flex flex-col gap-14">
                {isGroup && (
                  <div className="flex items-center gap-4 border-b border-ink-950/10 pb-6">
                    <span
                      className={clsx(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset',
                        categoryAccent === 'ember'
                          ? 'bg-ember-500/10 text-ember-500 ring-ember-500/20'
                          : 'bg-aqua-500/10 text-aqua-500 ring-aqua-500/20',
                      )}
                    >
                      <ServiceIcon name={category.icon} className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <h2 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">
                      {category.title}
                    </h2>
                  </div>
                )}

                <div
                  className={clsx(
                    'flex flex-col gap-16 sm:gap-20',
                    isGroup && 'border-r-2 border-ink-950/10 pr-8 sm:pr-10',
                  )}
                >
                  {category.subServices.map((service) => {
                    const i = serviceIndex
                    serviceIndex += 1
                    const accent = service.accent === 'aqua' ? 'aqua' : 'ember'
                    const reversed = i % 2 === 1

                    return (
                      <div
                        key={service.id}
                        id={service.id}
                        className="grid scroll-mt-28 gap-10 lg:grid-cols-2 lg:items-center"
                      >
                        <div className={clsx(reversed && 'lg:order-2')}>
                          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] border border-ink-950/8 shadow-sm">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/5 to-transparent" />
                            <span
                              className={clsx(
                                'absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset backdrop-blur',
                                accent === 'ember'
                                  ? 'bg-ember-500/20 text-ember-300 ring-ember-500/30'
                                  : 'bg-aqua-500/20 text-aqua-300 ring-aqua-500/30',
                              )}
                            >
                              <ServiceIcon name={service.icon} className="h-7 w-7" strokeWidth={1.75} />
                            </span>
                          </div>
                        </div>

                        <div className={clsx('flex flex-col gap-5', reversed && 'lg:order-1')}>
                          <span
                            className={clsx(
                              'inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ring-1 ring-inset',
                              accent === 'ember'
                                ? 'bg-ember-500/10 text-ember-600 ring-ember-500/20'
                                : 'bg-aqua-500/10 text-aqua-600 ring-aqua-500/20',
                            )}
                          >
                            خدمة 0{i + 1}
                          </span>
                          <h2 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">
                            {service.title}
                          </h2>
                          <p className="text-base leading-relaxed text-ink-500">{service.description}</p>

                          <ul className="flex flex-col gap-3">
                            {service.features.map((f) => (
                              <li key={f} className="flex items-start gap-3 text-sm text-ink-600">
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
                </div>
              </div>
            )
          })}
        </Container>
      </section>
    </>
  )
}
