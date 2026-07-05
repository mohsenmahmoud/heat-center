import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import clsx from 'clsx'
import Container from '../ui/Container'
import BrandMark from '../icons/BrandMark'
import { navLinks, siteConfig } from '../../data/content'
import { LinkButton } from '../ui/Button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'bg-white/90 shadow-ink backdrop-blur-lg' : 'bg-white/60 backdrop-blur-sm',
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandMark className="h-11 w-11 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-extrabold text-ink-950">
              {siteConfig.nameEn}
            </span>
            <span className="text-[11px] font-medium text-ember-600">{siteConfig.tagline}</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-ink-950/5 text-ember-600' : 'text-ink-600 hover:text-ink-950',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
            aria-label={siteConfig.phoneDisplay}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950/5 text-ink-600 hover:text-ember-600"
          >
            <Phone className="h-4 w-4" />
          </a>
          <LinkButton to="/contact" className="!py-2.5">
            احجز معاينة مجانية
          </LinkButton>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950/5 text-ink-950 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="فتح القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-ink-950/5 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'rounded-xl px-4 py-3 text-sm font-semibold',
                    isActive ? 'bg-ink-950/5 text-ember-600' : 'text-ink-600',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <LinkButton to="/contact" className="mt-2 justify-center">
              احجز معاينة مجانية
            </LinkButton>
          </Container>
        </div>
      )}
    </header>
  )
}
