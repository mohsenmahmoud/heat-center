import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import ServiceCard from '../components/ui/ServiceCard'
import { services } from '../data/content'

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="خدماتنا"
        title="منظومة متكاملة من حلول التدفئة والتسخين"
        description="من الاستشارة الأولى وحتى الصيانة الدورية، نغطي كل احتياجاتك فى التدفئة المركزية وتسخين المياه بمعدات أوروبية أصلية وفريق هندسي متخصص."
      />

      <section className="relative bg-ink-950 pb-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
