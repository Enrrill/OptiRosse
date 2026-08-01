import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/data/PageHeader'
import type { NavItem } from '@/lib/constants/nav'

export function PlaceholderPage({ item, description }: { item: NavItem; description?: string }) {
  return (
    <div>
      <PageHeader
        title={item.label}
        description={description ?? `Módulo ${item.label}. Se implementa en la fase correspondiente del roadmap.`}
      />
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary">
          <Icon name="construction" size={28} />
        </div>
        <p className="text-sm font-medium text-on-surface-variant">
          Módulo en construcción
        </p>
      </div>
    </div>
  )
}
