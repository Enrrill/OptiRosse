import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CloseButton } from '@/components/ui/close-button'
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
        className="sm:w-[720px] md:w-[840px] flex flex-col h-full overflow-hidden"
      >
        <DrawerHeader className="p-6 pb-4 flex-none border-b border-outline-variant">
          <div>
            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
            <DrawerDescription className="mt-1">{description}</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <CloseButton size="md" />
          </DrawerClose>
        </DrawerHeader>

        <ProductoForm
          key={producto?.id ?? 'nuevo'}
          producto={producto}
          onSuccess={close}
          onCancel={close}
        />
      </DrawerContent>
    </Drawer>
  )
}