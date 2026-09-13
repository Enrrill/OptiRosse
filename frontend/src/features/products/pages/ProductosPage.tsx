import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/data/PageHeader'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuth'
import { ProductosView } from '../components/ProductosView'
import type { ViewMode } from '@/components/ui/ViewToggle'

export default function ProductosPage() {
  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'empleado'
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [triggerNuevo, setTriggerNuevo] = useState(0)

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catálogo de productos con vista de cuadrícula o lista."
        actions={
          canManage ? (
            <Button onClick={() => setTriggerNuevo((t) => t + 1)}>
              <Plus size={18} /> Nuevo producto
            </Button>
          ) : undefined
        }
      />
      <ProductosView
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        triggerNuevo={triggerNuevo}
      />
    </div>
  )
}
