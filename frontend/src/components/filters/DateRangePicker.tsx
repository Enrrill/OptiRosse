import { Icon } from '@/components/Icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangePickerProps {
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  idPrefix?: string
}

export function DateRangePicker({
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  idPrefix = 'filter-date',
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 p-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
        <Icon name="calendar_today" size={14} className="text-primary" /> Rango de fechas
      </span>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-desde`} className="text-[11px] text-on-surface-variant font-medium">
            Desde
          </Label>
          <Input
            id={`${idPrefix}-desde`}
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="h-8.5 text-xs px-2 bg-surface-container-lowest border-outline-variant/80 focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-hasta`} className="text-[11px] text-on-surface-variant font-medium">
            Hasta
          </Label>
          <Input
            id={`${idPrefix}-hasta`}
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="h-8.5 text-xs px-2 bg-surface-container-lowest border-outline-variant/80 focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
