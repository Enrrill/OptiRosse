/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 font-label-sm text-label-sm uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-container/20 text-primary',
        secondary: 'bg-secondary-container/25 text-secondary',
        neutral: 'bg-surface-variant/40 text-on-surface-variant',
        success: 'bg-green-500/15 text-green-700 dark:text-green-300',
        warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        destructive: 'bg-error-container/50 text-error',
        outline: 'border border-outline-variant text-on-surface-variant',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
