import { Badge } from '@/components/ui/badge'
import type { ChoiceDisplay } from '@/lib/constants/choices'

export function StatusBadge({ display }: { display: ChoiceDisplay | null }) {
  if (!display) return <Badge variant="neutral">—</Badge>
  return <Badge variant="neutral" className={display.badge}>{display.label}</Badge>
}
