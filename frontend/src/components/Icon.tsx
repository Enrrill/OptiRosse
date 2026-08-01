import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
  name: string
  className?: string
  filled?: boolean
  size?: number
}

export function Icon({ name, className, filled = false, size }: IconProps) {
  const style: CSSProperties = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    ...(size !== undefined ? { fontSize: size } : {}),
  }

  return (
    <span aria-hidden="true" className={cn('material-symbols-outlined select-none', className)} style={style}>
      {name}
    </span>
  )
}
