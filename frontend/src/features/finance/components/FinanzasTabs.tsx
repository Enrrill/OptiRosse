import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
  const [triggerNuevo, setTriggerNuevo] = useState(0)

  const raw = searchParams.get('tab')
  const active: FinanzasTabKey = raw !== null && raw in TABS ? (raw as FinanzasTabKey) : DEFAULT_TAB

  const onValueChange = (value: string) => {
    const next = value in TABS ? (value as FinanzasTabKey) : DEFAULT_TAB
    setSearchParams(next === DEFAULT_TAB ? {} : { tab: next }, { replace: true })
  }

  const handleNuevoClick = () => {
    setTriggerNuevo((t) => t + 1)
  }

  return (
    <Tabs value={active} onValueChange={onValueChange}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="mb-0">
          {(Object.keys(TABS) as FinanzasTabKey[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              <Icon name={TABS[key].icon} size={16} />
              {TABS[key].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {active !== 'libro' && (
          <Button onClick={handleNuevoClick}>
            <Icon name="add" size={18} />
            {active === 'pagos' ? 'Registrar pago' : 'Nuevo método'}
          </Button>
        )}
      </div>

      <TabsContent value="pagos">
        <PagosTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="metodos">
        <MetodosTab triggerNuevo={triggerNuevo} />
      </TabsContent>
      <TabsContent value="libro">
        <LibroMayorTab />
      </TabsContent>
    </Tabs>
  )
}