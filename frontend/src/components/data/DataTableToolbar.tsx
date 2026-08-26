import type { ReactNode } from 'react'
import { Icon } from '@/components/Icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CloseButton } from '@/components/ui/close-button'
import { ActiveFilterChips, type ActiveFilterItem } from '@/components/filters/ActiveFilterChips'
import { FilterPopover } from '@/components/filters/FilterPopover'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  searchId?: string
  quickFilters?: ReactNode
  filterContent?: ReactNode
  activeFilterCount?: number
  activeFilters?: ActiveFilterItem[]
  onClearFilters?: () => void
  viewToggle?: ReactNode
  actions?: ReactNode
  className?: string
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  searchId = 'search-input',
  quickFilters,
  filterContent,
  activeFilterCount = 0,
  activeFilters = [],
  onClearFilters,
  viewToggle,
  actions,
  className,
}: DataTableToolbarProps) {
  const hasSearch = search !== undefined && onSearchChange !== undefined

  return (
    <div className={cn('flex flex-col gap-3 border-b border-outline-variant/40 p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {hasSearch && (
          <div className="relative w-full sm:max-w-sm shrink-0">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              id={searchId}
              name="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-8 bg-surface-container-lowest border-outline-variant/70 focus:border-primary"
            />
            {search && (
              <CloseButton
                size="xs"
                label="Limpiar búsqueda"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap sm:justify-end sm:ml-auto">
          {quickFilters}

          {filterContent && (
            <FilterPopover activeCount={activeFilterCount} onClearFilters={onClearFilters}>
              {filterContent}
            </FilterPopover>
          )}

          {activeFilterCount > 0 && onClearFilters && !filterContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2.5 text-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
            >
              <Icon name="filter_alt_off" size={14} className="mr-1" />
              Limpiar
            </Button>
          )}

          {viewToggle}

          {actions}
        </div>
      </div>

      {activeFilters.length > 0 && onClearFilters && (
        <ActiveFilterChips filters={activeFilters} onClearAll={onClearFilters} />
      )}
    </div>
  )
}
