import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import FAQItem from '../components/ui/FAQItem'
import { LinkButton } from '../components/ui/Button'
import { faqs } from '../data/content'

export default function FAQ() {
  return (
    <>
      <PageHero
        eyebrow="الأسئلة الشائعة"
        title="كل ما تريد معرفته عن التدفئة المركزية"
        description="جمعنا لك أكثر الأسئلة شيوعًا من عملائنا. لم تجد إجابتك؟ تواصل معنا مباشرة."
      />

      <section className="relative bg-ink-950 pb-24">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <FAQItem key={f.question} question={f.question} answer={f.answer} defaultOpen={i === 0} />
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-5 rounded-3xl border border-white/5 bg-white/[0.03] p-10 text-center">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              لسه عندك سؤال؟
            </h2>
            <p className="max-w-md text-sm text-ink-300">
              فريقنا جاهز يجاوبك على أي استفسار ويساعدك تختار الحل الأنسب لمساحتك.
            </p>
            <LinkButton to="/contact">تواصل معنا الآن</LinkButton>
          </div>
        </Container>
      </section>
    </>
  )
}
