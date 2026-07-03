import clsx from 'clsx'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceIcon from '../components/icons/ServiceIcon'
import { services, galleryImages } from '../data/content'

const allImages = services.flatMap((service) =>
  galleryImages[service.id].map((src, i) => ({
    src,
    key: `${service.id}-${i}`,
    service,
  })),
)

function scrollToCategory(id: string) {
  document.getElementById(`gallery-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Gallery() {
  return (
    <>
      <PageHero
        eyebrow="معرض الصور"
        title="لقطات من مشروعاتنا حسب نوع الخدمة"
        description="تصفح كل صور أعمالنا المنفذة، وكل صورة موضّح جانبها الخدمة اللي بتنتمي ليها."
      />

      <section className="relative bg-ink-950 pb-24">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => {
              const accent = s.accent === 'aqua' ? 'aqua' : 'ember'
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToCategory(s.id)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset transition-colors',
                    accent === 'ember'
                      ? 'text-ember-400 ring-ember-500/20 hover:bg-ember-500/10'
                      : 'text-aqua-400 ring-aqua-500/20 hover:bg-aqua-500/10',
                  )}
                >
                  <ServiceIcon name={s.icon} className="h-4 w-4" />
                  {s.title}
                </button>
              )
            })}
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allImages.map(({ src, key, service }) => {
              const accent = service.accent === 'aqua' ? 'aqua' : 'ember'
              return (
                <div
                  key={key}
                  id={`gallery-${service.id}`}
                  className="flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03]"
                >
                  <div
                    className={clsx(
                      'relative aspect-[4/3] overflow-hidden',
                      accent === 'aqua'
                        ? 'bg-gradient-to-br from-aqua-900 via-ink-900 to-ink-950'
                        : 'bg-gradient-to-br from-ember-950 via-ink-900 to-ink-950',
                    )}
                  >
                    <img
                      src={src}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    <span
                      className={clsx(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                        accent === 'ember'
                          ? 'bg-ember-500/10 text-ember-400 ring-ember-500/20'
                          : 'bg-aqua-500/10 text-aqua-400 ring-aqua-500/20',
                      )}
                    >
                      <ServiceIcon name={service.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold text-white">{service.title}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-ink-400">
            صور حقيقية من مشروعاتنا المنفذة قيد الإضافة — تواصل معنا للاطلاع على ملف أعمال مفصل.
          </p>
        </Container>
      </section>
    </>
  )
}
