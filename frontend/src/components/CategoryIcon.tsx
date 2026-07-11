import { Zap, Wrench, Wind, Sparkles, Scissors, Hammer, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  wrench: Wrench,
  wind: Wind,
  sparkles: Sparkles,
  scissors: Scissors,
}

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? Hammer
  return <Icon className={className} aria-hidden />
}

export const availableIcons = Object.keys(iconMap)
