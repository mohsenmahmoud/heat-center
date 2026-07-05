import { useState, type FormEvent } from 'react'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import Container from '../components/ui/Container'
import PageHero from '../components/ui/PageHero'
import { Button, LinkButton } from '../components/ui/Button'
import { WhatsAppIcon } from '../components/icons/SocialIcons'
import { siteConfig } from '../data/content'

const contactCards = [
  {
    icon: Phone,
    title: 'اتصل بنا',
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\s/g, '')}`,
  },
  {
    icon: WhatsAppIcon,
    title: 'واتساب',
    value: 'راسلنا مباشرة',
    href: `https://wa.me/${siteConfig.whatsapp}`,
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: MapPin,
    title: 'الموقع',
    value: siteConfig.address,
    href: '#',
  },
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHero
        eyebrow="تواصل معنا"
        title="خلّينا نصمملك حل التدفئة المناسب"
        description="احجز معاينة ميدانية مجانية، أو اترك بياناتك وفريقنا هيتواصل معاك خلال وقت قصير."
      />

      <section className="relative bg-white pb-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex flex-col gap-4 rounded-3xl border border-ink-950/8 bg-white p-6 shadow-sm transition-colors hover:border-ember-500/30"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-500 ring-1 ring-inset ring-ember-500/20">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink-950">{c.title}</h3>
                  <p dir="ltr" className="mt-1 text-left text-sm text-ink-500 sm:text-right sm:[direction:rtl]">
                    {c.value}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-ink-950/8 bg-ink-50 p-8 sm:p-10">
              <h2 className="font-display text-2xl font-extrabold text-ink-950">
                احجز معاينتك المجانية
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                املأ البيانات وفريقنا الهندسي هيتواصل معاك لتحديد أقرب موعد معاينة.
              </p>

              {submitted ? (
                <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-ember-500/20 bg-ember-500/5 p-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember-500/10 text-ember-500">
                    <Send className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink-950">
                    تم استلام طلبك بنجاح
                  </h3>
                  <p className="max-w-sm text-sm text-ink-500">
                    شكرًا لتواصلك مع هيت سنتر، فريقنا هيتصل بيك فى أقرب وقت لتحديد موعد المعاينة.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-ink-600">
                    الاسم بالكامل
                    <input
                      required
                      type="text"
                      placeholder="اكتب اسمك"
                      className="rounded-xl border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950 placeholder:text-ink-400 outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-ink-600">
                    رقم الهاتف
                    <input
                      required
                      type="tel"
                      dir="ltr"
                      placeholder="01xxxxxxxxx"
                      className="rounded-xl border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950 placeholder:text-ink-400 outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-ink-600 sm:col-span-2">
                    نوع الخدمة المطلوبة
                    <select className="rounded-xl border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950 outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20">
                      <option>التدفئة المركزية بالمياه الساخنة</option>
                      <option>التدفئة تحت الأرضية</option>
                      <option>الغلايات المركزية</option>
                      <option>السخانات الشمسية</option>
                      <option>تسخين حمامات السباحة</option>
                      <option>أعمال السباكة والتأسيس</option>
                      <option>غير ذلك / استشارة عامة</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-ink-600 sm:col-span-2">
                    تفاصيل إضافية
                    <textarea
                      rows={4}
                      placeholder="اكتب مساحة المكان أو أي تفاصيل تساعدنا نفهم احتياجك"
                      className="resize-none rounded-xl border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950 placeholder:text-ink-400 outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20"
                    />
                  </label>
                  <Button type="submit" className="sm:col-span-2 justify-center">
                    إرسال الطلب
                  </Button>
                </form>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="relative flex flex-1 flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-ink-800 to-ink-900 p-8">
                <div className="bg-grid pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-20" />
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-400">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">مواعيد العمل</h3>
                    <p className="text-sm text-ink-300">{siteConfig.workHours}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-relaxed text-ink-300">
                  نغطي مشروعات القاهرة الكبرى والمحافظات المجاورة. لأي منطقة أخرى، تواصل معنا
                  لمعرفة إمكانية التنفيذ.
                </div>
                <LinkButton
                  to={`https://wa.me/${siteConfig.whatsapp}`}
                  external
                  variant="secondary"
                  icon={<WhatsAppIcon className="h-4 w-4" />}
                  className="justify-center"
                >
                  تواصل سريع عبر واتساب
                </LinkButton>
              </div>

              <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[2rem] border border-ink-950/8 bg-ink-50">
                <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
                <span className="relative flex items-center gap-2 text-sm text-ink-500">
                  <MapPin className="h-4 w-4 text-ember-500" />
                  خريطة الموقع — قريبًا
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
