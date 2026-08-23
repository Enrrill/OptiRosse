import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  mobileOpen: boolean
  logoutModalOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openMobile: () => void
  closeMobile: () => void
  openLogoutModal: () => void
  closeLogoutModal: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  mobileOpen: false,
  logoutModalOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openMobile: () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
  openLogoutModal: () => set({ logoutModalOpen: true }),
  closeLogoutModal: () => set({ logoutModalOpen: false }),
}))
