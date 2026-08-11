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
import { UsuarioForm } from './UsuarioForm'
import type { Usuario } from '@/types/models'

interface UsuarioFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario | null
}

export function UsuarioFormDrawer({ open, onOpenChange, usuario }: UsuarioFormDrawerProps) {
  const title = usuario ? 'Editar usuario' : 'Nuevo usuario'
  const description = usuario
    ? `Actualiza la información de ${usuario.nombre_usuario}.`
    : 'Crea una cuenta para un nuevo usuario de la plataforma.'

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
          <UsuarioForm
            key={usuario?.id ?? 'nuevo'}
            usuario={usuario}
            onSuccess={close}
            onCancel={close}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
