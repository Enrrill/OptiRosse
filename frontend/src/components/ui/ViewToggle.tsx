import { Icon } from '@/components/Icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ViewMode = 'grid' | 'table'

interface ViewOption {
  value: ViewMode
  label: string
  icon: string
  tooltip: string
}

const DEFAULT_OPTIONS: ViewOption[] = [
  {
    value: 'grid',
    label: 'Cuadrícula',
    icon: 'grid_view',
    tooltip: 'Vista en cuadrícula',
  },
  {
    value: 'table',
    label: 'Lista',
    icon: 'format_list_bulleted',
    tooltip: 'Vista en lista/tabla',
  },
]

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  options?: ViewOption[]
  className?: string
  id?: string
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
  options = DEFAULT_OPTIONS,
  className,
  id = 'view-toggle',
}: ViewToggleProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div
        id={id}
        role="radiogroup"
        aria-label="Modo de vista"
        className={cn(
          'inline-flex h-8.5 items-center rounded-xl border border-outline-variant/70 bg-surface-container-low p-0.5 shadow-2xs',
          className,
        )}
      >
        {options.map((opt) => {
          const isActive = viewMode === opt.value
          return (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={opt.tooltip}
                  onClick={() => onViewModeChange(opt.value)}
                  className={cn(
                    'flex h-7 items-center justify-center rounded-lg px-2 text-xs font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold scale-[1.02] ring-1 ring-outline-variant/30'
                      : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60',
                  )}
                >
                  <Icon name={opt.icon} size={16} className="shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{opt.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
