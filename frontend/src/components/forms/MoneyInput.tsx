import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function MoneyInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
        $
      </span>
      <Input className={cn('pl-7', className)} inputMode="decimal" {...props} />
    </div>
  )
}

export { MoneyInput }
