import type { ReactNode } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FilterPopoverProps {
  activeCount: number
  onClearFilters?: () => void
  children: ReactNode
  className?: string
}

export function FilterPopover({
  activeCount,
  onClearFilters,
  children,
  className,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'relative gap-1.5 font-medium border-outline-variant/80 bg-surface-container-lowest hover:bg-surface-container-low hover:text-on-surface text-on-surface-variant transition-all duration-200 shadow-2xs',
            activeCount > 0 && 'border-primary/60 text-primary bg-primary-container/20 font-semibold',
            className,
          )}
        >
          <Icon name="tune" size={16} className={activeCount > 0 ? 'text-primary' : 'text-on-surface-variant'} />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-on-primary">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-4 rounded-2xl border border-outline-variant/80 bg-surface-container-lowest shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="tune" size={18} className="text-primary" />
            <h4 className="text-sm font-semibold text-on-surface">Filtros de la tabla</h4>
            {activeCount > 0 && (
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-medium text-on-primary-container">
                {activeCount} activo{activeCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {activeCount > 0 && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2 text-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1 pr-1.5 -m-1">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}
