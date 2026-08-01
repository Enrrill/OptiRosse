import type { ReactNode } from 'react'
import { Icon } from '@/components/Icon'

export function EmptyState({
  title = 'No hay resultados',
  description,
  action,
  icon = 'inbox',
}: {
  title?: string
  description?: string
  action?: ReactNode
  icon?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="font-heading text-headline-md text-on-surface">{title}</h3>
      {description && <p className="max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {action}
    </div>
  )
}
