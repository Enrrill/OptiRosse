import { PageHeader } from '@/components/data/PageHeader'
import { InventarioTabs } from '../components/InventarioTabs'

export default function InventarioPage() {
  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Categorías, productos y control de stock."
      />
      <InventarioTabs />
    </div>
  )
}