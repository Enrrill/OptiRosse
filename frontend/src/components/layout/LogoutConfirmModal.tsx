import { useState } from 'react'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { useLogout } from '@/hooks/useLogout'
import { useUIStore } from '@/store/useUI'

export function LogoutConfirmModal() {
  const open = useUIStore((s) => s.logoutModalOpen)
  const closeLogoutModal = useUIStore((s) => s.closeLogoutModal)
  const logout = useLogout()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await logout()
    } finally {
      setLoading(false)
      closeLogoutModal()
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) closeLogoutModal()
      }}
      title="¿Cerrar sesión?"
      description="Se cerrará tu sesión activa de manera segura en OptiRosse. Deberás ingresar nuevamente para continuar."
      confirmLabel="Cerrar sesión"
      cancelLabel="Cancelar"
      variant="destructive"
      loading={loading}
      onConfirm={handleConfirm}
    />
  )
}
