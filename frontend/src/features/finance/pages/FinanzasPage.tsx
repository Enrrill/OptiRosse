import { PageHeader } from '@/components/data/PageHeader'
import { FinanzasTabs } from '../components/FinanzasTabs'

export default function FinanzasPage() {
  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Métodos de pago, gestión de pagos y libro mayor."
      />
      <FinanzasTabs />
    </div>
  )
}