import { useSearchParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/components/Icon'
import { MetodosTab } from './MetodosTab'
import { PagosTab } from './PagosTab'
import { LibroMayorTab } from './LibroMayorTab'

const TABS = {
  pagos: { label: 'Pagos', icon: 'payments' },
  metodos: { label: 'Métodos de pago', icon: 'credit_card' },
  libro: { label: 'Libro mayor', icon: 'account_balance' },
} as const

export type FinanzasTabKey = keyof typeof TABS

const DEFAULT_TAB: FinanzasTabKey = 'pagos'

export function FinanzasTabs() {
  const [searchParams, setSearchParams] = useSearchParams()

  const raw = searchParams.get('tab')
  const active: FinanzasTabKey = raw !== null && raw in TABS ? (raw as FinanzasTabKey) : DEFAULT_TAB

  const onValueChange = (value: string) => {
    const next = value in TABS ? (value as FinanzasTabKey) : DEFAULT_TAB
    setSearchParams(next === DEFAULT_TAB ? {} : { tab: next }, { replace: true })
  }

  return (
    <Tabs value={active} onValueChange={onValueChange}>
      <TabsList className="mb-4">
        {(Object.keys(TABS) as FinanzasTabKey[]).map((key) => (
          <TabsTrigger key={key} value={key}>
            <Icon name={TABS[key].icon} size={16} />
            {TABS[key].label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="pagos">
        <PagosTab />
      </TabsContent>
      <TabsContent value="metodos">
        <MetodosTab />
      </TabsContent>
      <TabsContent value="libro">
        <LibroMayorTab />
      </TabsContent>
    </Tabs>
  )
}