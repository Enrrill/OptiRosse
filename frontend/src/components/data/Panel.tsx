import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-heading text-headline-md text-on-surface">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
