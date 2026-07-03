import { Building2, Home as HomeIcon, Hotel, Landmark } from 'lucide-react'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import { LinkButton } from '../components/ui/Button'
import { projectTypes, stats } from '../data/content'

const icons = [HomeIcon, Building2, Hotel, Landmark]

export default function Projects() {
  return (
    <>
      <PageHero
        eyebrow="أعمالنا"
        title="أكثر من 250 مشروعًا تتحدث عن نفسها"
        description="نفّذنا أنظمة تدفئة وتسخين لأنواع متعددة من المشروعات، من الفيلا الواحدة إلى الكمباوندات والمنشآت الكبرى، وكلها بنفس معايير الجودة والدقة."
      />

      <section className="relative bg-ink-950 pb-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projectTypes.map((p, i) => {
              const Icon = icons[i]
              return (
                <div
                  key={p.title}
                  className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-8"
                >
                  <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-ember-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-400 ring-1 ring-inset ring-ember-500/20">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-300">{p.description}</p>
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* GALLERY PLACEHOLDER GRID */}
      <section className="relative bg-ink-900 py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <Container className="relative">
          <SectionHeading
            eyebrow="معرض الأعمال"
            title="لقطات من مشروعاتنا المنفذة"
            description="صور حقيقية من مشروعاتنا قيد الإضافة — تواصل معنا للاطلاع على ملف أعمال مفصل بالمشروعات المنجزة."
          />

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-ink-800 to-ink-950"
              >
                <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
                <div className="pointer-events-none absolute h-24 w-24 rounded-full bg-ember-500/10 blur-2xl transition-opacity duration-500 group-hover:bg-ember-500/25" />
                <span className="relative font-display text-xs font-bold text-ink-500">
                  صورة مشروع {i + 1}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* STATS STRIP */}
      <section className="relative bg-ink-950 py-24">
        <Container>
          <div className="grid grid-cols-2 gap-8 rounded-3xl border border-white/5 bg-white/[0.03] px-8 py-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  {s.value}
                  <span className="text-ember-500">{s.suffix}</span>
                </span>
                <span className="text-sm font-medium text-ink-300">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-5 text-center">
            <h2 className="max-w-xl text-balance font-display text-2xl font-extrabold text-white sm:text-3xl">
              عايز مشروعك يكون الإضافة الجاية لملف أعمالنا؟
            </h2>
            <LinkButton to="/contact">ابدأ مشروعك معنا</LinkButton>
          </div>
        </Container>
      </section>
    </>
  )
}
