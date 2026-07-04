import { Flame, Layers, Droplets, Sun, Waves, Wrench, Zap, Timer, type LucideProps } from 'lucide-react'
import type { Service } from '../../data/content'

const iconMap: Record<Service['icon'], typeof Flame> = {
  flame: Flame,
  waves: Layers,
  droplet: Droplets,
  sun: Sun,
  instant: Timer,
  pool: Waves,
  pipe: Wrench,
  panel: Zap,
}

export default function ServiceIcon({ name, ...props }: { name: Service['icon'] } & LucideProps) {
  const Icon = iconMap[name]
  return <Icon {...props} />
}
