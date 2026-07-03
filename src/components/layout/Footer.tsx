import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import Container from '../ui/Container'
import BrandMark from '../icons/BrandMark'
import { FacebookIcon, InstagramIcon, LinkedinIcon } from '../icons/SocialIcons'
import { navLinks, services, siteConfig } from '../../data/content'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-950">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <Container className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-12 w-12" />
              <span className="font-display text-xl font-extrabold text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
              شركة مصرية متخصصة فى تصميم وتنفيذ أنظمة التدفئة المركزية والسخانات الشمسية منذ 8
              سنوات، بخبرة 250+ مشروعًا وأكثر من 700 عميل راضٍ.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: FacebookIcon, href: siteConfig.social.facebook },
                { icon: InstagramIcon, href: siteConfig.social.instagram },
                { icon: LinkedinIcon, href: siteConfig.social.linkedin },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-ink-200 transition-colors hover:bg-ember-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white">روابط سريعة</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-ink-300 hover:text-ember-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white">خدماتنا</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/services/${s.id}`}
                    className="text-sm text-ink-300 hover:text-ember-400"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white">تواصل معنا</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-ember-500" />
                <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} dir="ltr" className="hover:text-ember-400">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-ember-500" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-ember-400">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" />
                <span>{siteConfig.workHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name} — جميع الحقوق محفوظة.</p>
          <p>صُنع بعناية هندسية لدفء منزلك.</p>
        </div>
      </Container>
    </footer>
  )
}
