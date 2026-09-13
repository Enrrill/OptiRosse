import { Badge } from '@/components/ui/badge'
import type { ChoiceDisplay } from '@/lib/constants/choices'

export function StatusBadge({ display }: { display: ChoiceDisplay | null }) {
  if (!display) return <Badge variant="neutral">—</Badge>
  return (
    <Badge variant="neutral" className={display.badge}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {display.label}
    </Badge>
  )
}
