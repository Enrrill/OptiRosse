import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { CategoriasTab } from './CategoriasTab'
import { ProductosTab } from './ProductosTab'
import { VariantesTab } from './VariantesTab'

const TABS = {
  categorias: { label: 'Categorías', icon: 'category' },
  productos: { label: 'Productos', icon: 'inventory_2' },
  variantes: { label: 'Variantes', icon: 'barcode_scanner' },
} as const

export type InventarioTabKey = keyof typeof TABS

const DEFAULT_TAB: InventarioTabKey = 'categorias'

export function InventarioTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [triggerNuevo, setTriggerNuevo] = useState(0)

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'almacen'

  const raw = searchParams.get('tab')
  const active: InventarioTabKey =
    raw !== null && raw in TABS ? (raw as InventarioTabKey) : DEFAULT_TAB

  const onValueChange = (value: string) => {
    const next = value in TABS ? (value as InventarioTabKey) : DEFAULT_TAB
    setSearchParams(next === DEFAULT_TAB ? {} : { tab: next }, { replace: true })
  }

  const handleNuevoClick = () => {
    setTriggerNuevo((t) => t + 1)
  }

  return (
    <Tabs value={active} onValueChange={onValueChange}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="mb-0">
          {(Object.keys(TABS) as InventarioTabKey[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              <Icon name={TABS[key].icon} size={16} />
              {TABS[key].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {canManage && active !== 'variantes' && (
          <Button onClick={handleNuevoClick}>
            <Icon name="add" size={18} />
            {active === 'categorias' ? 'Nueva categoría' : 'Nuevo producto'}
          </Button>
        )}
      </div>

      <TabsContent value="categorias">
        <CategoriasTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="productos">
        <ProductosTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="variantes">
        <VariantesTab />
      </TabsContent>
    </Tabs>
  )
}