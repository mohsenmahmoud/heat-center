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
        scrolled || open
          ? 'bg-ink-950/90 shadow-ink backdrop-blur-lg'
          : 'bg-gradient-to-b from-ink-950/70 to-transparent',
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandMark className="h-11 w-11 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-extrabold text-white">
              {siteConfig.name}
            </span>
            <span className="text-[11px] font-medium text-ember-400">{siteConfig.tagline}</span>
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
                  isActive ? 'bg-white/5 text-ember-400' : 'text-ink-200 hover:text-white',
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
            className="flex items-center gap-2 text-sm font-bold text-ink-100 hover:text-ember-400"
          >
            <Phone className="h-4 w-4" />
            {siteConfig.phoneDisplay}
          </a>
          <LinkButton to="/contact" className="!py-2.5">
            احجز معاينة مجانية
          </LinkButton>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="فتح القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-white/5 bg-ink-950 lg:hidden">
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
                    isActive ? 'bg-white/5 text-ember-400' : 'text-ink-200',
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
