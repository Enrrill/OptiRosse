import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'

export type KpiVariant = 'primary' | 'secondary' | 'amber' | 'green' | 'error' | 'default'

export interface KpiCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon: string
  variant?: KpiVariant
  link?: { to: string; label: string }
}

const VARIANT_CLASSES: Record<
  KpiVariant,
  { card: string; chip: string; label: string; value: string }
> = {
  primary: {
    card: 'bg-primary-container text-on-primary-container shadow-sm',
    chip: 'bg-white/20',
    label: 'opacity-80',
    value: '',
  },
  secondary: {
    card: 'bg-secondary-container text-on-secondary-container shadow-sm',
    chip: 'bg-white/20',
    label: 'opacity-80',
    value: '',
  },
  amber: {
    card: 'border-l-4 border-amber-500 bg-surface-container-lowest shadow-sm',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    label: 'text-on-surface-variant',
    value: 'text-on-surface',
  },
  green: {
    card: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 shadow-sm',
    chip: 'bg-green-500/20',
    label: 'opacity-80',
    value: '',
  },
  error: {
    card: 'bg-error-container text-on-error-container shadow-sm',
    chip: 'bg-white/20',
    label: 'opacity-80',
    value: '',
  },
  default: {
    card: 'border border-outline-variant bg-surface-container-lowest shadow-sm',
    chip: 'bg-surface-container-high text-primary',
    label: 'text-on-surface-variant',
    value: 'text-on-surface',
  },
}

export function KpiCard({ label, value, sub, icon, variant = 'default', link }: KpiCardProps) {
  const styles = VARIANT_CLASSES[variant]

  return (
    <div
      className={cn(
        'flex h-40 flex-col justify-between rounded-xl p-md transition-transform duration-300 hover:-translate-y-0.5',
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', styles.chip)}>
          <Icon name={icon} size={20} filled={variant !== 'default'} />
        </span>
        {link && (
          <Link
            to={link.to}
            className="font-label-sm font-medium underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        )}
      </div>
      <div>
        <p className={cn('font-label-sm uppercase tracking-widest', styles.label)}>{label}</p>
        <p className={cn('font-heading text-headline-lg leading-none mt-xs', styles.value)}>
          {value}
        </p>
        {sub && <p className={cn('mt-1 text-sm', styles.label)}>{sub}</p>}
      </div>
    </div>
  )
}
