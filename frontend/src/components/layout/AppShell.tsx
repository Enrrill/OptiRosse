import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { LogoutConfirmModal } from './LogoutConfirmModal'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUIStore } from '@/store/useUI'
import { cn } from '@/lib/utils'

export function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen">
        <Sidebar />
        <Topbar />
        <main
          className={cn(
            'min-h-screen p-4 pt-20 transition-all duration-300 md:px-8 md:pb-8 md:pt-20 lg:pt-20',
            collapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
          )}
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
        <LogoutConfirmModal />
      </div>
    </TooltipProvider>
  )
}
