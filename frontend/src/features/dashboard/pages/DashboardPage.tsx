import { useEffect } from 'react'
import { Link } from 'react-router'
import dayjs from 'dayjs'
import { PageHeader } from '@/components/data/PageHeader'
import { Panel } from '@/components/data/Panel'
import { ErrorState } from '@/components/data/ErrorState'
import { useAuthStore } from '@/store/useAuth'
import { useToast } from '@/store/useToast'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardSkeleton } from '../components/DashboardSkeleton'
import { buildKpiCards } from '../components/kpiConfig'
import { KpiGrid } from '../components/KpiGrid'
import { QuickActions } from '../components/QuickActions'
import { RecentOrders } from '../components/RecentOrders'
import { RecentPayments } from '../components/RecentPayments'

const WELCOME_KEY = 'opirosse-bienvenida'

export default function DashboardPage() {
  const { resumen, isLoading, isError, error, refetch } = useDashboard()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()

  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_KEY)) return
    const nombre = user ? `${user.nombre} ${user.apellido}`.trim() || user.nombre_usuario : ''
    toast.success(`Bienvenido${nombre ? `, ${nombre}` : ''} a OptiRosse`)
    sessionStorage.setItem(WELCOME_KEY, '1')
  }, [user, toast])

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return <ErrorState message={error?.defaultMessage} onRetry={() => refetch()} />
  }

  if (!resumen) return null

  const kpiCards = buildKpiCards(resumen.kpis)
  const { pedidos = [], pagos } = resumen.recientes

  return (
    <div>
      <PageHeader
        title="Panel de control"
        description={`Resumen de actividad para ${dayjs(resumen.fecha).format('dddd D [de] MMMM')}`}
      />

      {kpiCards.length > 0 && <KpiGrid cards={kpiCards} />}

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Últimos pedidos"
          action={
            <Link className="font-label-sm text-primary underline-offset-4 hover:underline" to="/pedidos">
              Ver todos
            </Link>
          }
        >
          <RecentOrders pedidos={pedidos} />
        </Panel>
        {pagos !== undefined && pagos !== null && (
          <Panel
            title="Últimos pagos"
            action={
              <Link className="font-label-sm text-primary underline-offset-4 hover:underline" to="/finanzas">
                Ver todos
              </Link>
            }
          >
            <RecentPayments pagos={pagos} />
          </Panel>
        )}
      </div>
    </div>
  )
}
