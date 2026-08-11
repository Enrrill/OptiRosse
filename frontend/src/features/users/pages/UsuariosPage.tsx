import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/data/PageHeader'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { useToast } from '@/store/useToast'
import { usePagination } from '@/hooks/usePagination'
import type { PaginationParams } from '@/types/api'
import { useUsuarios } from '../hooks/useUsuarios'
import { useDesactivarUsuario, useReactivarUsuario } from '../hooks/useUsuarioMutations'
import { UsuariosTable } from '../components/UsuariosTable'
import { UsuarioFormDrawer } from '../components/UsuarioFormDrawer'
import type { RolUsuario, Usuario } from '@/types/models'

export default function UsuariosPage() {
  const pagination = usePagination()
  const [showInactivos, setShowInactivos] = useState(false)
  const [rolFiltro, setRolFiltro] = useState<RolUsuario | ''>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Usuario | null>(null)

  const toast = useToast()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const params = useMemo<PaginationParams>(() => {
    const p: PaginationParams = { ...pagination.params }
    if (showInactivos) p.activo = 'false'
    if (rolFiltro) p.rol = rolFiltro
    return p
  }, [pagination.params, showInactivos, rolFiltro])

  const { usuarios, count, isLoading, isError, error, refetch } = useUsuarios(params)

  const desactivar = useDesactivarUsuario(estadoTarget?.id ?? null)
  const reactivar = useReactivarUsuario(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (usuario: Usuario) => {
    setEditing(usuario)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    if (estadoTarget.id === currentUserId) {
      toast.error('No puedes desactivar tu propia cuenta')
      setEstadoTarget(null)
      return
    }
    if (estadoTarget.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setEstadoTarget(null)
  }

  const esInactivo = estadoTarget != null && !estadoTarget.activo
  const nombreEstado = estadoTarget
    ? [estadoTarget.nombre, estadoTarget.apellido].filter(Boolean).join(' ').trim() ||
      estadoTarget.nombre_usuario
    : ''

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestiona las cuentas del personal y sus roles de acceso."
        actions={
          <Button onClick={abrirNuevo}>
            <Icon name="add" size={18} /> Nuevo usuario
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Usuarios
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <Icon name="manage_accounts" size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-on-surface">{count}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Cuentas registradas en la plataforma</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Estado del filtro
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <Icon name={showInactivos ? 'person_off' : 'verified_user'} size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">
            {showInactivos ? 'Inactivos' : 'Activos'}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {showInactivos ? 'Mostrando cuentas desactivadas' : 'Mostrando cuentas habilitadas'}
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              En Pantalla
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
              <Icon name="group" size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-on-surface">{usuarios.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Resultados de la página actual</p>
        </div>
      </div>

      <UsuariosTable
        usuarios={usuarios}
        count={count}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={pagination.search}
        onSearchChange={(value) => {
          pagination.setSearch(value)
          pagination.resetPage()
        }}
        showInactivos={showInactivos}
        onToggleInactivos={(value) => {
          setShowInactivos(value)
          pagination.resetPage()
        }}
        rolFiltro={rolFiltro}
        onRolChange={(value) => {
          setRolFiltro(value)
          pagination.resetPage()
        }}
        currentUserId={currentUserId}
        onEdit={abrirEdicion}
        onToggleEstado={(usuario) => setEstadoTarget(usuario)}
        onNuevo={abrirNuevo}
      />

      <UsuarioFormDrawer open={formOpen} onOpenChange={setFormOpen} usuario={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar este usuario?' : '¿Desactivar este usuario?'}
        description={
          esInactivo
            ? `${nombreEstado} volverá a poder iniciar sesión en la plataforma.`
            : `${nombreEstado} dejará de aparecer en las listas por defecto y no podrá iniciar sesión. Sus registros y movimientos se conservan.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}
