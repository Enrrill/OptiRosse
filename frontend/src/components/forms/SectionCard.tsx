import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  icon?: LucideIcon
  title: string
  children: ReactNode
  className?: string
}

export function SectionCard({ icon: IconComp, title, children, className }: SectionCardProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-primary">
        {IconComp && <IconComp size={20} />}
        <h4 className="font-label-sm text-label-sm uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </section>
  )
}
