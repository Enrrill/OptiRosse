import type { ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[520px]',
  lg: 'sm:max-w-[680px]',
  xl: 'sm:max-w-[840px]',
} as const

interface AppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: keyof typeof SIZE_CLASSES
  children: ReactNode
  className?: string
}

export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  className,
}: AppDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          'max-h-[90vh]',
          SIZE_CLASSES[size],
          className,
        )}
      >
        <DrawerHeader className="text-left border-b border-outline-variant/30 pb-4">
          <DrawerTitle className="font-heading text-lg font-bold">{title}</DrawerTitle>
          {description && (
            <DrawerDescription className="text-sm text-on-surface-variant">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="overflow-y-auto p-6">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
