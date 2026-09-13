import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Tag, ScanBarcode, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuth'
import { CategoriasTab } from './CategoriasTab'
import { MarcasTab } from './MarcasTab'
import { VariantesTab } from './VariantesTab'

const TABS = {
  categorias: { label: 'Categorías', icon: Tag },
  marcas: { label: 'Marcas', icon: Tag },
  variantes: { label: 'Variantes', icon: ScanBarcode },
} as const

export type InventarioTabKey = keyof typeof TABS

const DEFAULT_TAB: InventarioTabKey = 'categorias'

export function InventarioTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [triggerNuevo, setTriggerNuevo] = useState(0)

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'empleado'

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
          {(Object.keys(TABS) as InventarioTabKey[]).map((key) => {
            const IconComp = TABS[key].icon
            return (
              <TabsTrigger key={key} value={key}>
                <IconComp size={16} />
                {TABS[key].label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {canManage && (
          <Button onClick={handleNuevoClick}>
            <Plus size={18} />
            {active === 'categorias'
              ? 'Nueva categoría'
              : 'Nueva marca'}
          </Button>
        )}
      </div>

      <TabsContent value="categorias">
        <CategoriasTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="marcas">
        <MarcasTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="variantes">
        <VariantesTab />
      </TabsContent>
    </Tabs>
  )
}
