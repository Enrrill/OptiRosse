import type { ReactNode } from 'react'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  icon?: string
  title: string
  children: ReactNode
  className?: string
}

export function SectionCard({ icon, title, children, className }: SectionCardProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-primary">
        {icon && <Icon name={icon} size={20} />}
        <h4 className="font-label-sm text-label-sm uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </section>
  )
}
