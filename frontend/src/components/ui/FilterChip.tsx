import { Icon } from '@/components/Icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  chipText?: string
  label?: string
  activeLabel?: string
  className?: string
  id?: string
}

export function FilterChip({
  checked,
  onCheckedChange,
  chipText = 'Inactivos',
  label = 'Mostrar inactivos',
  activeLabel = 'Mostrando inactivos',
  className,
  id,
}: FilterChipProps) {
  const currentLabel = checked ? activeLabel : label

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={currentLabel}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            'inline-flex h-8.5 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary shadow-2xs',
            checked
              ? 'border-primary/50 bg-primary-container/30 text-primary font-semibold'
              : 'border-outline-variant/80 bg-surface-container-lowest text-on-surface-variant hover:border-outline hover:bg-surface-container-low hover:text-on-surface',
            className,
          )}
        >
          <Icon
            name={checked ? 'visibility_off' : 'visibility'}
            size={14}
            className={cn('shrink-0', checked ? 'text-primary' : 'text-on-surface-variant')}
          />
          <span>{chipText}</span>
          {checked && (
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{currentLabel}</p>
      </TooltipContent>
    </Tooltip>
  )
}
