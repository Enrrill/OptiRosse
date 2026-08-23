import { useEffect } from 'react'
import { Link } from 'react-router'
import dayjs from 'dayjs'
import { Icon } from '@/components/Icon'
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
  const { pedidos = [], pagos = [] } = resumen.recientes

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de control"
        description={`Resumen de actividad para ${dayjs(resumen.fecha).format('dddd D [de] MMMM')}`}
      />

      {kpiCards.length > 0 && <KpiGrid cards={kpiCards} />}

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Últimos pedidos"
          noPadding
          action={
            <Link
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              to="/pedidos"
            >
              <span>Ver todos</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          }
        >
          <RecentOrders pedidos={pedidos} />
        </Panel>
        {pagos !== undefined && pagos !== null && (
          <Panel
            title="Últimos pagos"
            noPadding
            action={
              <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                to="/finanzas"
              >
                <span>Ver todos</span>
                <Icon name="arrow_forward" size={14} />
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
