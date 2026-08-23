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
  { card: string; chip: string; label: string; value: string; link: string }
> = {
  primary: {
    card: 'bg-primary-container text-on-primary-container border border-primary/20 shadow-xs hover:shadow-md',
    chip: 'bg-white/20 text-white',
    label: 'opacity-85 text-xs font-semibold tracking-wider',
    value: 'text-white',
    link: 'text-white/90 hover:text-white',
  },
  secondary: {
    card: 'bg-secondary-container text-on-secondary-container border border-secondary/20 shadow-xs hover:shadow-md',
    chip: 'bg-white/20 text-on-secondary-container',
    label: 'opacity-85 text-xs font-semibold tracking-wider',
    value: '',
    link: 'text-on-secondary-container/90 hover:text-on-secondary-container',
  },
  amber: {
    card: 'border-l-4 border-l-amber-500 border border-outline-variant/60 bg-surface-container-lowest shadow-xs hover:shadow-md',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    label: 'text-on-surface-variant text-xs font-semibold tracking-wider',
    value: 'text-on-surface',
    link: 'text-amber-600 dark:text-amber-400 hover:underline',
  },
  green: {
    card: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 shadow-xs hover:shadow-md',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    label: 'text-emerald-800/80 dark:text-emerald-300/80 text-xs font-semibold tracking-wider',
    value: 'text-emerald-950 dark:text-emerald-100',
    link: 'text-emerald-700 dark:text-emerald-300 hover:underline',
  },
  error: {
    card: 'bg-error-container text-on-error-container border border-error/20 shadow-xs hover:shadow-md',
    chip: 'bg-white/20 text-on-error-container',
    label: 'opacity-85 text-xs font-semibold tracking-wider',
    value: '',
    link: 'text-on-error-container hover:underline',
  },
  default: {
    card: 'border border-outline-variant/70 bg-surface-container-lowest shadow-xs hover:shadow-md',
    chip: 'bg-surface-container-high text-primary',
    label: 'text-on-surface-variant text-xs font-semibold tracking-wider',
    value: 'text-on-surface',
    link: 'text-primary hover:underline',
  },
}

export function KpiCard({ label, value, sub, icon, variant = 'default', link }: KpiCardProps) {
  const styles = VARIANT_CLASSES[variant]

  return (
    <div
      className={cn(
        'flex min-h-[9.25rem] flex-col justify-between rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1',
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105', styles.chip)}>
          <Icon name={icon} size={20} filled={variant !== 'default'} />
        </span>
        {link && (
          <Link
            to={link.to}
            className={cn('text-xs font-medium underline-offset-4 transition-colors', styles.link)}
          >
            {link.label}
          </Link>
        )}
      </div>
      <div className="mt-3">
        <p className={cn('uppercase', styles.label)}>{label}</p>
        <p className={cn('font-heading text-2xl font-bold leading-tight mt-1 tracking-tight', styles.value)}>
          {value}
        </p>
        {sub && <p className={cn('mt-0.5 text-xs opacity-80', styles.label)}>{sub}</p>}
      </div>
    </div>
  )
}
