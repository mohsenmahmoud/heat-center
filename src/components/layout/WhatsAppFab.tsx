import { MessageCircle } from 'lucide-react'
import { siteConfig } from '../../data/content'

export default function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_-12px_rgba(37,211,102,0.6)] transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-6 w-6" fill="white" />
    </a>
  )
}
