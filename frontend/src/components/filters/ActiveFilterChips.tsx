import { Button } from '@/components/ui/button'
import { CloseButton } from '@/components/ui/close-button'

export interface ActiveFilterItem {
  id: string
  label: string
  valueDisplay: string
  onRemove: () => void
}

interface ActiveFilterChipsProps {
  filters: ActiveFilterItem[]
  onClearAll: () => void
}

export function ActiveFilterChips({ filters, onClearAll }: ActiveFilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-medium text-on-surface-variant/70">Filtros:</span>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high/80 border border-outline-variant/60 px-2.5 py-0.5 text-xs text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <span className="font-medium text-on-surface-variant">{filter.label}:</span>
          <span className="font-semibold text-primary">{filter.valueDisplay}</span>
          <CloseButton
            size="xs"
            label={`Remover filtro ${filter.label}`}
            onClick={filter.onRemove}
            className="-mr-1"
          />
        </span>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
        >
          Limpiar todo
        </Button>
      )}
    </div>
  )
}
