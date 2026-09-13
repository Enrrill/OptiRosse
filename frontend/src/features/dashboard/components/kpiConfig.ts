import type { KpiCardProps } from '@/components/data/KpiCard'
import { formatMoney, formatNumber } from '@/lib/format'
import type { DashboardKpis } from '@/types/models'
import {
  Package,
  Microscope,
  ShoppingCart,
  CheckCircle2,
  DollarSign,
  Users,
  AlertTriangle,
  Wallet,
  CreditCard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ESTADOS_ORDEN = [
  { key: 'confirmado', label: 'Confirmados', icon: Package, variant: 'primary' },
  { key: 'en_laboratorio', label: 'En laboratorio', icon: Microscope, variant: 'secondary' },
  { key: 'listo_para_entrega', label: 'Listos para entrega', icon: ShoppingCart, variant: 'amber' },
  { key: 'entregado', label: 'Entregados', icon: CheckCircle2, variant: 'green' },
] as const

export function buildKpiCards(kpis: DashboardKpis): KpiCardProps[] {
  const cards: KpiCardProps[] = []

  const estados = kpis.pedidos_por_estado
  if (estados) {
    for (const { key, label, icon, variant } of ESTADOS_ORDEN) {
      const value = estados[key]
      if (typeof value === 'number') {
        cards.push({ label, icon: icon as LucideIcon, variant, value: formatNumber(value) })
      }
    }
  }

  if (kpis.total_vendido_mes != null) {
    cards.push({
      label: 'Vendido del mes',
      icon: DollarSign,
      variant: 'primary',
      value: formatMoney(kpis.total_vendido_mes),
    })
  }

  if (kpis.clientes != null) {
    cards.push({
      label: 'Clientes activos',
      icon: Users,
      variant: 'secondary',
      value: formatNumber(kpis.clientes),
    })
  }

  if (kpis.stock_bajo != null) {
    cards.push({
      label: 'Stock bajo',
      icon: AlertTriangle,
      variant: 'amber',
      value: formatNumber(kpis.stock_bajo),
      sub: 'items',
      link: { to: '/inventario', label: 'Ver inventario' },
    })
  }

  if (kpis.pagos_pendientes) {
    const { cantidad, monto } = kpis.pagos_pendientes
    cards.push({
      label: 'Pagos pendientes',
      icon: Wallet,
      variant: 'green',
      value: formatMoney(monto),
      sub: `${formatNumber(cantidad)} pagos`,
    })
  }

  if (kpis.saldo_por_cobrar != null) {
    cards.push({
      label: 'Saldo por cobrar',
      icon: CreditCard,
      variant: kpis.saldo_por_cobrar < 0 ? 'error' : 'default',
      value: formatMoney(kpis.saldo_por_cobrar),
    })
  }

  return cards
}
