import { useSearchParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/components/Icon'
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

  const raw = searchParams.get('tab')
  const active: InventarioTabKey =
    raw !== null && raw in TABS ? (raw as InventarioTabKey) : DEFAULT_TAB

  const onValueChange = (value: string) => {
    const next = value in TABS ? (value as InventarioTabKey) : DEFAULT_TAB
    setSearchParams(next === DEFAULT_TAB ? {} : { tab: next }, { replace: true })
  }

  return (
    <Tabs value={active} onValueChange={onValueChange}>
      <TabsList className="mb-4">
        {(Object.keys(TABS) as InventarioTabKey[]).map((key) => (
          <TabsTrigger key={key} value={key}>
            <Icon name={TABS[key].icon} size={16} />
            {TABS[key].label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="categorias">
        <CategoriasTab />
      </TabsContent>
      <TabsContent value="productos">
        <ProductosTab />
      </TabsContent>
      <TabsContent value="variantes">
        <VariantesTab />
      </TabsContent>
    </Tabs>
  )
}