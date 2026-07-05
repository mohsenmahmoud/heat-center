import { Award, Compass, HeartHandshake, Target, Users } from 'lucide-react'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import StatCounter from '../components/ui/StatCounter'
import { LinkButton } from '../components/ui/Button'
import { stats } from '../data/content'

const values = [
  {
    icon: Award,
    title: 'الجودة أولًا',
    description: 'لا نساوم على جودة المعدات أو دقة التنفيذ مهما كان حجم المشروع.',
  },
  {
    icon: Compass,
    title: 'دقة هندسية',
    description: 'كل مشروع يبدأ بدراسة وتصميم مخصص، لا حلول جاهزة أو عشوائية.',
  },
  {
    icon: HeartHandshake,
    title: 'شفافية كاملة',
    description: 'أسعار وعروض واضحة منذ أول لقاء، بلا تكاليف مخفية أو مفاجآت.',
  },
  {
    icon: Users,
    title: 'عميل لعمر',
    description: 'علاقتنا بعملائنا لا تنتهي بالتسليم، بل تستمر بالمتابعة والصيانة.',
  },
]

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="من نحن"
        title="شريكك الهندسي فى الدفء منذ 8 سنوات"
        description="هيت سنتر شركة مصرية 100% متخصصة فى مقاولات التدفئة المركزية وحلول تسخين المياه، بخبرة تراكمية أثبتت جدارتها فى عشرات الكمباوندات والفلل والمنشآت."
      />

      {/* STORY */}
      <section className="relative bg-white pb-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-bold uppercase tracking-widest text-ember-600">
                قصتنا
              </span>
              <h2 className="font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">
                من فكرة هندسية إلى أكثر من 250 مشروعًا ناجحًا
              </h2>
              <p className="text-base leading-relaxed text-ink-500">
                انطلقت هيت سنتر برؤية واضحة: أن يحصل كل بيت مصري على دفء حقيقي ومياه ساخنة مستمرة
                دون تعقيد أو حلول مؤقتة. اعتمدنا منذ اليوم الأول على المعدات الأوروبية الأصلية
                والتصميم الهندسي الدقيق بدلًا من الحلول الجاهزة، وهو ما مكّننا من تنفيذ أكثر من
                250 مشروعًا فى أكثر من 40 كمباوند وفيلا ومنشأة خلال 8 سنوات.
              </p>
              <p className="text-base leading-relaxed text-ink-500">
                اليوم، نفخر بثقة أكثر من 700 عميل اختاروا هيت سنتر لتصميم وتنفيذ أنظمة التدفئة
                المركزية، التدفئة الأرضية، الغلايات المركزية، والسخانات الشمسية فى مشروعاتهم —
                وما زلنا نطوّر خبراتنا لنقدّم لهم الأفضل دائمًا.
              </p>
              <div className="mt-2">
                <LinkButton to="/services">استعرض خدماتنا</LinkButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 rounded-3xl border border-ink-950/8 bg-ink-50 p-8">
              {stats.map((s) => (
                <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* MISSION / VISION */}
      <section className="relative bg-ink-50 py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <Container className="relative">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-ink-950/8 bg-white p-9 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-500 ring-1 ring-inset ring-ember-500/20">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-950">رسالتنا</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                تقديم حلول تدفئة وتسخين متكاملة عالية الكفاءة، تجمع بين الجودة الأوروبية والدقة
                الهندسية، لضمان راحة وأمان دائمين لعملائنا بأقل تكلفة تشغيل ممكنة.
              </p>
            </div>
            <div className="rounded-3xl border border-ink-950/8 bg-white p-9 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aqua-500/10 text-aqua-500 ring-1 ring-inset ring-aqua-500/20">
                <Compass className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-950">رؤيتنا</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                أن نكون الاسم الأول الذي يخطر ببال كل عائلة أو مطوّر عقاري فى مصر عند التفكير فى
                التدفئة المركزية والطاقة الشمسية، من خلال التوسع المستمر مع الحفاظ على أعلى معايير
                الجودة.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* VALUES */}
      <section className="relative bg-white py-24">
        <Container>
          <SectionHeading eyebrow="قيمنا" title="ما يميز طريقة عملنا" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="flex flex-col gap-4 rounded-3xl border border-ink-950/8 bg-white p-7 text-center items-center shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-500 ring-1 ring-inset ring-ember-500/20">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-bold text-ink-950">{v.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{v.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
