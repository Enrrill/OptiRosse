import { Outlet } from 'react-router'
import { useUIStore } from '@/store/useUI'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LogoutConfirmModal } from './LogoutConfirmModal'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div
          className="flex flex-1 flex-col overflow-hidden transition-[margin] duration-300"
          style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
        >
          <Header />
          <main
            className="flex-1 overflow-y-auto p-4 pt-[calc(var(--header-height)+16px)] md:px-8 md:pb-8"
          >
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
        <LogoutConfirmModal />
      </div>
    </TooltipProvider>
  )
}
