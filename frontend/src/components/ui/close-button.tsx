import * as React from 'react'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'subtle' | 'outline'
  iconSize?: number
  label?: string
}

const sizeClasses = {
  xs: 'h-5 w-5 p-0.5',
  sm: 'h-7 w-7 p-1',
  md: 'h-9 w-9 p-1.5',
  lg: 'h-10 w-10 p-2',
}

const defaultIconSizes = {
  xs: 12,
  sm: 16,
  md: 18,
  lg: 20,
}

const variantClasses = {
  ghost:
    'text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface active:bg-surface-container-highest',
  subtle:
    'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:bg-surface-container-highest',
  outline:
    'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:bg-surface-container-highest',
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  (
    {
      size = 'md',
      variant = 'ghost',
      iconSize,
      label = 'Cerrar',
      className,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const finalIconSize = iconSize ?? defaultIconSizes[size]

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <Icon name="close" size={finalIconSize} />
        <span className="sr-only">{label}</span>
      </button>
    )
  },
)

CloseButton.displayName = 'CloseButton'
