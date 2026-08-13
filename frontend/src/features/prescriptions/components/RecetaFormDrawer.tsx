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
import { RecetaForm } from './RecetaForm'
import type { RecetaOptica } from '@/types/models'

interface RecetaFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receta?: RecetaOptica | null
}

export function RecetaFormDrawer({ open, onOpenChange, receta }: RecetaFormDrawerProps) {
  const paciente = receta?.nombre_paciente || 'Sin paciente'
  const title = receta ? 'Editar receta' : 'Nueva receta'
  const description = receta
    ? `Actualiza la graduación de ${paciente}.`
    : 'Registra la graduación óptica de un paciente.'

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
          <RecetaForm
            key={receta?.id ?? 'nuevo'}
            receta={receta}
            onSuccess={close}
            onCancel={close}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
