import { PageHeader } from '@/components/data/PageHeader'
import { InventarioTabs } from '../components/InventarioTabs'

export default function InventarioPage() {
  return (
    <div>
      <PageHeader
        title="Catálogos"
        description="Categorías, marcas y variantes de productos."
      />
      <InventarioTabs />
    </div>
  )
}