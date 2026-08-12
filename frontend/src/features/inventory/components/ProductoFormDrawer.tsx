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
import { ProductoForm } from './ProductoForm'
import type { Producto } from '@/types/models'

interface ProductoFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: Producto | null
}

export function ProductoFormDrawer({ open, onOpenChange, producto }: ProductoFormDrawerProps) {
  const title = producto ? 'Editar producto' : 'Nuevo producto'
  const description = producto
    ? `Edita ${producto.marca} ${producto.codigo_modelo} y sus variantes.`
    : 'Registra un producto y sus variantes (SKU, stock y precios).'

  const close = () => onOpenChange(false)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="sm:w-[720px] md:w-[840px]"
      >
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
          <ProductoForm
            key={producto?.id ?? 'nuevo'}
            producto={producto}
            onSuccess={close}
            onCancel={close}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}