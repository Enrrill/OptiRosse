import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Icon } from '@/components/Icon'
import { ClienteForm } from './ClienteForm'
import type { Cliente } from '@/types/models'

interface ClienteFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
}

export function ClienteFormDrawer({ open, onOpenChange, cliente }: ClienteFormDrawerProps) {
  const title = cliente ? 'Editar cliente' : 'Nuevo cliente'
  const description = cliente
    ? `Actualiza la información de ${cliente.nombre_comercial}.`
    : 'Registra un nuevo cliente en la plataforma.'

  const close = () => onOpenChange(false)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:w-[540px] md:w-[640px]">
        <DrawerHeader className="p-6 pb-4">
          <div>
            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
            <DrawerDescription className="mt-1">{description}</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Cerrar">
              <Icon name="close" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <ClienteForm
            key={cliente?.id ?? 'nuevo'}
            cliente={cliente}
            onSuccess={close}
            onCancel={close}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
