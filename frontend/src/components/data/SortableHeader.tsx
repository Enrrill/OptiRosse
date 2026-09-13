import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function SortableHeader<TData, TValue>({
  column,
  title,
  className,
}: SortableHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort()

  if (!canSort) {
    return <span className={className}>{title}</span>
  }

  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-1 text-left text-inherit hover:text-on-surface transition-colors',
        className,
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp size={14} className="shrink-0 text-primary" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown size={14} className="shrink-0 text-primary" />
      ) : (
        <ArrowUpDown size={14} className="shrink-0 text-on-surface-variant/40" />
      )}
    </button>
  )
}
