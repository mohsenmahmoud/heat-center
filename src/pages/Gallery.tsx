import { useState } from 'react'
import clsx from 'clsx'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceIcon from '../components/icons/ServiceIcon'
import { services, galleryImages, type ServiceId } from '../data/content'

export default function Gallery() {
  const [activeId, setActiveId] = useState<ServiceId>(services[0].id)
  const active = services.find((s) => s.id === activeId)!
  const images = galleryImages[activeId]

  return (
    <>
      <PageHero
        eyebrow="معرض الصور"
        title="لقطات من مشروعاتنا حسب نوع الخدمة"
        description="تصفح صور أعمالنا المنفذة مصنّفة حسب كل خدمة — من التدفئة المركزية إلى الطاقة الشمسية."
      />

      <section className="relative bg-ink-950 pb-24">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => {
              const isActive = s.id === activeId
              const accent = s.accent === 'aqua' ? 'aqua' : 'ember'
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset transition-colors',
                    isActive
                      ? accent === 'ember'
                        ? 'bg-ember-500/15 text-ember-400 ring-ember-500/30'
                        : 'bg-aqua-500/15 text-aqua-400 ring-aqua-500/30'
                      : 'text-ink-300 ring-white/10 hover:text-white',
                  )}
                >
                  <ServiceIcon name={s.icon} className="h-4 w-4" />
                  {s.title}
                </button>
              )
            })}
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src, i) => (
              <div
                key={src + i}
                className={clsx(
                  'relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-white/5',
                  active.accent === 'aqua'
                    ? 'bg-gradient-to-br from-aqua-900 via-ink-900 to-ink-950'
                    : 'bg-gradient-to-br from-ember-950 via-ink-900 to-ink-950',
                )}
              >
                <img src={src} alt={active.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-ink-400">
            صور حقيقية من مشروعاتنا المنفذة قيد الإضافة — تواصل معنا للاطلاع على ملف أعمال مفصل.
          </p>
        </Container>
      </section>
    </>
  )
}
