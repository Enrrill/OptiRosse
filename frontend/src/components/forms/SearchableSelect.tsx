import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

export interface SearchableOption<T> {
  value: string
  label: string
  description?: string
  data: T
}

interface SearchableSelectProps<T> {
  keyId?: string
  value: T | null
  onChange: (value: T | null) => void
  /** Debe ser estable (módulo) para no romper la caché de la query. */
  searchOptions: (query: string) => Promise<SearchableOption<T>[]>
  formatSelected: (value: T) => string
  placeholder: string
  emptyText?: string
  className?: string
}

export function SearchableSelect<T>({
  keyId = 'generic',
  value,
  onChange,
  searchOptions,
  formatSelected,
  placeholder,
  emptyText = 'Sin resultados',
  className,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: options = [], isFetching } = useQuery({
    queryKey: ['searchable-select', keyId, debouncedQuery],
    queryFn: () => searchOptions(debouncedQuery),
    enabled: open,
    staleTime: 60_000,
    placeholderData: (prev) => prev ?? [],
  })

  const handleSelect = (option: SearchableOption<T>) => {
    onChange(option.data)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-10 w-full justify-between font-normal',
            !value && 'text-on-surface-variant',
            className,
          )}
        >
          <span className={cn('truncate', value && 'text-on-surface')}>
            {value ? formatSelected(value) : placeholder}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {value != null && (
              <span
                role="button"
                tabIndex={-1}
                className="rounded-full p-0.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
              >
                <Icon name="close" size={16} />
              </span>
            )}
            <Icon name="expand_more" size={18} className="text-on-surface-variant" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
            className="h-11"
          />
          <CommandList>
            {isFetching && options.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-6 text-sm text-on-surface-variant">
                <Icon name="progress_activity" size={16} className="animate-spin" />
                Buscando...
              </div>
            )}
            {!isFetching && options.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option)}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.description && (
                    <span className="truncate text-xs text-on-surface-variant">
                      {option.description}
                    </span>
                  )}
                </div>
                {value != null &&
                  formatSelected(value) === option.label && (
                    <Icon name="check" size={18} className="shrink-0 text-primary" />
                  )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}