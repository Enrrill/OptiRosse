import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Panel({ title, action, children, className, noPadding = false }: PanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col justify-between rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs overflow-hidden transition-all duration-300',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-outline-variant/30 bg-surface-container-lowest">
        <h3 className="font-heading text-base font-bold text-on-surface tracking-tight">{title}</h3>
        {action}
      </div>
      <div className={cn('flex-1', !noPadding ? 'p-6' : 'p-0')}>{children}</div>
    </section>
  )
}
