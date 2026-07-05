import { useState } from 'react'
import clsx from 'clsx'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceIcon from '../components/icons/ServiceIcon'
import { services, galleryImages, type ServiceId } from '../data/content'

const allImages = services.flatMap((service) =>
  galleryImages[service.id].map((src, i) => ({
    src,
    key: `${service.id}-${i}`,
    service,
  })),
)

export default function Gallery() {
  const [activeId, setActiveId] = useState<ServiceId | null>(null)
  const visibleImages = activeId
    ? allImages.filter((img) => img.service.id === activeId)
    : allImages

  return (
    <>
      <PageHero
        eyebrow="معرض الصور"
        title="لقطات من مشروعاتنا حسب نوع الخدمة"
        description="تصفح كل صور أعمالنا المنفذة، أو فلتر حسب نوع الخدمة اللي بتهمك."
      />

      <section className="relative bg-white pb-24">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveId(null)}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset transition-colors',
                activeId === null
                  ? 'bg-ember-500 text-white ring-ember-500'
                  : 'text-ember-600 ring-ember-500/20 hover:bg-ember-500/10',
              )}
            >
              كل الصور
            </button>
            {services.map((s) => {
              const accent = s.accent === 'aqua' ? 'aqua' : 'ember'
              const isActive = activeId === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset transition-colors',
                    isActive
                      ? accent === 'ember'
                        ? 'bg-ember-500 text-white ring-ember-500'
                        : 'bg-aqua-500 text-white ring-aqua-500'
                      : accent === 'ember'
                        ? 'text-ember-600 ring-ember-500/20 hover:bg-ember-500/10'
                        : 'text-aqua-600 ring-aqua-500/20 hover:bg-aqua-500/10',
                  )}
                >
                  <ServiceIcon name={s.icon} className="h-4 w-4" />
                  {s.title}
                </button>
              )
            })}
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleImages.map(({ src, key, service }) => {
              const accent = service.accent === 'aqua' ? 'aqua' : 'ember'
              return (
                <div
                  key={key}
                  className="flex flex-col overflow-hidden rounded-3xl border border-ink-950/8 bg-ink-50 shadow-sm"
                >
                  <div
                    className={clsx(
                      'relative aspect-[4/3] overflow-hidden',
                      accent === 'aqua'
                        ? 'bg-gradient-to-br from-aqua-100 via-ink-50 to-white'
                        : 'bg-gradient-to-br from-ember-100 via-ink-50 to-white',
                    )}
                  >
                    <img
                      src={src}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-ink-500">
            صور حقيقية من مشروعاتنا المنفذة قيد الإضافة — تواصل معنا للاطلاع على ملف أعمال مفصل.
          </p>
        </Container>
      </section>
    </>
  )
}
