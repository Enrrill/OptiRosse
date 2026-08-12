import { cn } from '@/lib/utils'
import { formatNumber, nivelStock } from '@/lib/format'

const STOCK_STYLES = {
  empty: 'bg-error-container/60 text-error',
  low: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  ok: 'bg-green-500/15 text-green-700 dark:text-green-300',
} as const

interface StockBadgeProps {
  stock: number
  alertaMinima?: number
  suffix?: string
  className?: string
}

export function StockBadge({ stock, alertaMinima = 0, suffix, className }: StockBadgeProps) {
  const level = nivelStock(stock, alertaMinima)
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold',
        STOCK_STYLES[level],
        className,
      )}
    >
      {formatNumber(stock)}
      {suffix ? <span className="ml-0.5 font-medium text-inherit opacity-70">{suffix}</span> : null}
    </span>
  )
}