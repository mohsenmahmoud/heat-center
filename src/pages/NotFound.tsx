import { Flame } from 'lucide-react'
import Container from '../components/ui/Container'
import { LinkButton } from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-white pt-24">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="bg-radial-ember pointer-events-none absolute inset-0" />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ember-500/10 text-ember-500 ring-1 ring-inset ring-ember-500/20">
          <Flame className="h-8 w-8" />
        </span>
        <h1 className="font-display text-5xl font-black text-ink-950">404</h1>
        <p className="max-w-md text-balance text-ink-500">
          الصفحة اللي بتدور عليها مش موجودة أو تم نقلها. ارجع للرئيسية أو تواصل معنا لو محتاج
          مساعدة.
        </p>
        <LinkButton to="/">العودة للرئيسية</LinkButton>
      </Container>
    </section>
  )
}
