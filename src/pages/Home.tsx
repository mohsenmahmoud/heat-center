import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import StatCounter from '../components/ui/StatCounter'
import ServiceCard from '../components/ui/ServiceCard'
import FAQItem from '../components/ui/FAQItem'
import { LinkButton } from '../components/ui/Button'
import { WhatsAppIcon } from '../components/icons/SocialIcons'
import { asset, faqs, process, projectTypes, services, siteConfig, stats, whyUs } from '../data/content'

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white pb-24 pt-40 sm:pb-32 sm:pt-48">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="bg-radial-ember pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 animate-float rounded-full bg-aqua-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 animate-glow rounded-full bg-ember-500/10 blur-3xl" />

        <Container className="relative">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-ember-500/10 px-4 py-1.5 text-xs font-bold text-ember-600 ring-1 ring-inset ring-ember-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              شركة مصرية 100% — خبرة 8 سنوات فى التدفئة المركزية
            </span>

            <h1 className="mt-7 text-balance font-display text-4xl font-extrabold leading-[1.15] text-ink-950 sm:text-5xl lg:text-6xl">
              دفء دائم لبيتك…
              <br />
              <span className="bg-gradient-to-l from-ember-400 via-ember-500 to-ember-600 bg-clip-text text-transparent">
                براحة لا تنتهي
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-ink-500 sm:text-lg">
              نصمم وننفذ أنظمة التدفئة المركزية، السخانات الشمسية، والغلايات المركزية بمعايير
              أوروبية، وبخبرة هندسية أثبتت جدارتها فى أكثر من 250 مشروعًا و40 كمباوند وفيلا داخل
              مصر.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <LinkButton to="/contact" icon={<ArrowLeft className="h-4 w-4" />}>
                احجز معاينة مجانية الآن
              </LinkButton>
              <LinkButton
                to={`https://wa.me/${siteConfig.whatsapp}`}
                external
                variant="secondary"
                icon={<WhatsAppIcon className="h-4 w-4" />}
              >
                تواصل عبر واتساب
              </LinkButton>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2rem] border border-ink-950/8 shadow-ink">
            <img
              src={asset('images/hero/home.webp')}
              alt="تركيب سخان شمسي من هيت سنتر"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
            />
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-8 rounded-3xl border border-ink-950/8 bg-ink-50 px-8 py-10 sm:grid-cols-4">
            {stats.map((s) => (
              <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </Container>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="relative bg-ink-50 py-24">
        <Container>
          <SectionHeading
            eyebrow="خدماتنا"
            title="منظومة متكاملة من حلول التدفئة والتسخين"
            description="من التصميم الهندسي إلى التركيب والصيانة، نغطي كل ما يحتاجه مشروعك من أنظمة تدفئة وتسخين عالية الكفاءة."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <LinkButton to="/services" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              استعرض كل الخدمات
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* SOLAR CALLOUT */}
      <section className="relative overflow-hidden bg-white py-6">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-ember-600 via-ember-500 to-ember-400 px-8 py-14 sm:px-14">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-ink-950/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-right">
              <div className="flex items-center gap-5">
                <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white sm:flex">
                  <Sun className="h-8 w-8" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                    وفّر حتى 89% من فاتورة الكهرباء
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
                    سخانات شمسية أوروبية الصنع بعمر افتراضي يتجاوز 20 عامًا — مثالية لمناخ مصر
                    المشمس طوال العام.
                  </p>
                </div>
              </div>
              <LinkButton to="/services#solar-heaters" variant="secondary" className="!bg-white !text-ember-600 shadow-none hover:!bg-white/90">
                اعرف أكثر عن السخانات الشمسية
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* WHY US */}
      <section className="relative bg-ink-50 py-24">
        <Container>
          <SectionHeading
            eyebrow="لماذا هيت سنتر"
            title="خبرة هندسية تستحق ثقتك"
            description="لا نبيع منتجًا فقط، بل نصمم لك منظومة متكاملة تراعي كل تفصيلة فى مساحتك."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-3xl border border-ink-950/8 bg-white p-7 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-500 ring-1 ring-inset ring-ember-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-bold text-ink-950">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PROCESS */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <Container className="relative">
          <SectionHeading
            eyebrow="خطوات العمل"
            title="من المعاينة إلى التسليم فى 5 خطوات"
            description="منهجية واضحة تضمن لك تجربة سلسة من أول اتصال وحتى الاستمتاع بالدفء."
          />

          <div className="mt-16 grid gap-6 lg:grid-cols-5">
            {process.map((p, i) => (
              <div key={p.step} className="relative flex flex-col gap-4 rounded-3xl border border-ink-950/8 bg-ink-50 p-6">
                <span className="font-display text-3xl font-black text-ember-500/40">{p.step}</span>
                <h3 className="font-display text-base font-bold text-ink-950">{p.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{p.description}</p>
                {i < process.length - 1 && (
                  <ArrowLeft className="pointer-events-none absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-ink-300 lg:block" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PROJECTS PREVIEW */}
      <section className="relative bg-ink-50 py-24">
        <Container>
          <SectionHeading
            eyebrow="أعمالنا"
            title="مشروعات تتحدث عن جودة التنفيذ"
            description="من الفلل الخاصة إلى الكمباوندات الكبرى والمنشآت السياحية."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projectTypes.map((p) => (
              <div
                key={p.title}
                className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-3xl border border-white/5 p-6"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />
                <div className="pointer-events-none absolute inset-0 bg-radial-ember opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <BadgeCheck className="absolute right-6 top-6 h-6 w-6 text-white/70" />
                <h3 className="relative font-display text-lg font-bold text-white">{p.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-200">{p.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <LinkButton to="/projects" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              تصفح جميع أعمالنا
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* FAQ PREVIEW */}
      <section className="relative bg-white py-24">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="أسئلة شائعة" title="كل ما تريد معرفته قبل أن تبدأ" />

          <div className="mt-12 flex flex-col gap-4">
            {faqs.slice(0, 4).map((f, i) => (
              <FAQItem key={f.question} question={f.question} answer={f.answer} defaultOpen={i === 0} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <LinkButton to="/faq" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
              عرض كل الأسئلة
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink-50 pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-ink-800 to-ink-900 px-8 py-16 text-center sm:px-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
            <div className="pointer-events-none absolute right-1/2 top-0 h-64 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-ember-500/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-400 ring-1 ring-inset ring-ember-500/20">
                <CalendarClock className="h-6 w-6" />
              </span>
              <h2 className="max-w-xl text-balance font-display text-3xl font-extrabold text-white sm:text-4xl">
                جاهز تبدأ رحلة الدفء مع هيت سنتر؟
              </h2>
              <p className="max-w-lg text-balance text-ink-300">
                احجز معاينة ميدانية مجانية اليوم، وخلي فريقنا الهندسي يصمملك الحل الأنسب لمساحتك.
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                <LinkButton to="/contact" icon={<ArrowLeft className="h-4 w-4" />}>
                  احجز معاينتك المجانية
                </LinkButton>
                <LinkButton to="/services" variant="secondary">
                  تصفح خدماتنا
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
