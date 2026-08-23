import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/errors'
import { useAuthStore } from '@/store/useAuth'
import { useUIStore } from '@/store/useUI'
import { useToast } from '@/store/useToast'
import { ROLES, choice } from '@/lib/constants/choices'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/data/PageHeader'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/forms/FieldError'
import { Skeleton } from '@/components/ui/skeleton'
import type { Usuario } from '@/types/models'

const passwordSchema = z
  .object({
    contrasena_actual: z.string().min(1, 'Ingresa tu contraseña actual'),
    contrasena_nueva: z
      .string()
      .min(8, 'Debe tener al menos 8 caracteres')
      .max(128, 'Debe tener como máximo 128 caracteres'),
    confirmacion: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.contrasena_nueva === data.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden',
  })

type PasswordForm = z.infer<typeof passwordSchema>

function PasswordForm() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onSubmit = handleSubmit(async ({ contrasena_actual, contrasena_nueva }) => {
    setLoading(true)
    try {
      await apiClient.post(AUTH_ENDPOINTS.cambiarContrasena, {
        contrasena_actual,
        contrasena_nueva,
      })
      toast.success('Contraseña actualizada correctamente')
      reset()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.status === 400) {
        setError('contrasena_actual', {
          message: apiErr.messages[0] ?? 'La contraseña actual es incorrecta',
        })
      } else {
        toast.error(apiErr.defaultMessage || 'No se pudo cambiar la contraseña')
      }
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="contrasena_actual">Contraseña actual</Label>
        <div className="relative">
          <Input
            id="contrasena_actual"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-10"
            {...register('contrasena_actual')}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
            tabIndex={-1}
          >
            <Icon name={showCurrent ? 'visibility_off' : 'visibility'} size={18} />
          </button>
        </div>
        <FieldError message={errors.contrasena_actual?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contrasena_nueva">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="contrasena_nueva"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-10"
              {...register('contrasena_nueva')}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
              tabIndex={-1}
            >
              <Icon name={showNew ? 'visibility_off' : 'visibility'} size={18} />
            </button>
          </div>
          <FieldError message={errors.contrasena_nueva?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmacion">Confirmar nueva contraseña</Label>
          <div className="relative">
            <Input
              id="confirmacion"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-10"
              {...register('confirmacion')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
              tabIndex={-1}
            >
              <Icon name={showConfirm ? 'visibility_off' : 'visibility'} size={18} />
            </button>
          </div>
          <FieldError message={errors.confirmacion?.message} />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-on-surface-variant/80">
          La contraseña debe contener al menos 8 caracteres.
        </p>
        <Button type="submit" loading={loading} className="rounded-xl px-5">
          {!loading && <Icon name="lock_reset" size={18} />}
          <span>Cambiar contraseña</span>
        </Button>
      </div>
    </form>
  )
}

export default function PerfilPage() {
  const openLogoutModal = useUIStore((s) => s.openLogoutModal)
  const authUser = useAuthStore((s) => s.user)

  const { data: response, isLoading } = useQuery<{ data: Usuario }>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get(AUTH_ENDPOINTS.me).then((res) => res.data),
  })
  const user = response?.data || authUser

  const rol = user ? choice(ROLES, user.rol) : null
  const nombre = user?.nombre?.trim() || ''
  const apellido = user?.apellido?.trim() || ''
  const nombreCompleto = `${nombre} ${apellido}`.trim() || user?.nombre_usuario || 'Usuario'
  const iniciales = user
    ? (nombre[0] && apellido[0]
        ? `${nombre[0]}${apellido[0]}`
        : nombre[0] || user.nombre_usuario?.[0] || 'U'
      ).toUpperCase()
    : 'U'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil de Usuario"
        description="Gestiona tu información personal, credenciales de acceso y preferencias de cuenta."
      />

      {/* Profile Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container font-heading font-bold text-2xl border border-primary/20 shadow-xs">
            {iniciales}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="font-heading text-xl font-bold text-on-surface tracking-tight">
                {nombreCompleto}
              </h2>
              {user && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-medium text-on-surface/80">@{user?.nombre_usuario}</span>
              {user?.correo && (
                <>
                  <span className="text-outline/50">•</span>
                  <span>{user.correo}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={openLogoutModal}
          className="rounded-full px-4 text-xs font-semibold border-error-container/60 text-error hover:bg-error-container/20 hover:border-error-container self-center sm:self-auto"
        >
          <Icon name="logout" size={16} />
          <span>Cerrar sesión</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info Panel */}
        <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-primary pb-2 border-b border-outline-variant/30">
            <Icon name="person" size={20} />
            <h3 className="font-heading text-base font-bold text-on-surface">Información de la cuenta</h3>
          </div>

          {isLoading || !user ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30 text-sm">
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <Icon name="mail" size={18} className="text-outline" />
                  Correo electrónico
                </span>
                <span className="font-semibold text-on-surface">{user.correo}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <Icon name="call" size={18} className="text-outline" />
                  Teléfono
                </span>
                <span className="font-semibold text-on-surface">{user.telefono || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <Icon name="shield" size={18} className="text-outline" />
                  Rol asignado
                </span>
                <StatusBadge display={rol} />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <Icon name="calendar_month" size={18} className="text-outline" />
                  Miembro desde
                </span>
                <span className="font-medium text-on-surface">
                  {new Date(user.creado_en).toLocaleDateString('es-VE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Panel */}
        <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-primary pb-2 border-b border-outline-variant/30">
            <Icon name="key" size={20} />
            <h3 className="font-heading text-base font-bold text-on-surface">Seguridad y contraseña</h3>
          </div>

          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
