import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/errors'
import { useAuthStore } from '@/store/useAuth'
import { useToast } from '@/store/useToast'
import { useLogout } from '@/hooks/useLogout'
import { ROLES, choice } from '@/lib/constants/choices'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/data/PageHeader'
import { SectionCard } from '@/components/forms/SectionCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/forms/FieldError'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
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
        <Input
          id="contrasena_actual"
          type="password"
          autoComplete="current-password"
          {...register('contrasena_actual')}
        />
        <FieldError message={errors.contrasena_actual?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contrasena_nueva">Nueva contraseña</Label>
          <Input
            id="contrasena_nueva"
            type="password"
            autoComplete="new-password"
            {...register('contrasena_nueva')}
          />
          <FieldError message={errors.contrasena_nueva?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmacion">Confirmar nueva contraseña</Label>
          <Input
            id="confirmacion"
            type="password"
            autoComplete="new-password"
            {...register('confirmacion')}
          />
          <FieldError message={errors.confirmacion?.message} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {!loading && <Icon name="lock_reset" />}
          Cambiar contraseña
        </Button>
      </div>
    </form>
  )
}

function AccountInfo() {
  const { data: response, isLoading } = useQuery<{ data: Usuario }>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get(AUTH_ENDPOINTS.me).then((res) => res.data),
  })
  const user = response?.data

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const rol = choice(ROLES, user.rol)
  const iniciales = `${user.nombre[0] ?? ''}${user.apellido[0] ?? ''}`.toUpperCase()
  const nombreCompleto = `${user.nombre} ${user.apellido}`.trim()

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container-highest text-xl font-bold text-primary">
          {iniciales}
        </div>
        <div>
          <h3 className="font-heading text-headline-md text-on-surface">{nombreCompleto}</h3>
          <p className="text-sm text-on-surface-variant">@{user.nombre_usuario}</p>
        </div>
      </div>

      <dl className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-on-surface-variant">Correo</dt>
          <dd className="text-sm font-medium">{user.correo}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-on-surface-variant">Teléfono</dt>
          <dd className="text-sm font-medium">{user.telefono ?? '—'}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-on-surface-variant">Rol</dt>
          <dd>
            <StatusBadge display={rol} />
          </dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-on-surface-variant">Estado</dt>
          <dd>
            <StatusBadge
              display={
                user.activo
                  ? { label: 'Activo', badge: 'bg-green-500/15 text-green-700 dark:text-green-300' }
                  : { label: 'Inactivo', badge: 'bg-error-container/50 text-error' }
              }
            />
          </dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm text-on-surface-variant">Miembro desde</dt>
          <dd className="text-sm font-medium">
            {new Date(user.creado_en).toLocaleDateString('es-VE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const nombre = user ? `${user.nombre} ${user.apellido}`.trim() : ''

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="Gestiona tus datos personales, contraseña y sesión."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Datos de la cuenta">
          <AccountInfo />
        </SectionCard>

        <SectionCard title="Cambiar contraseña">
          <PasswordForm />
        </SectionCard>
      </div>

      <div className="mt-6 rounded-xl border border-error-container bg-error-container/20 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Icon name="logout" className="mt-0.5 text-error" />
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Cerrar sesión</h4>
              <p className="text-sm text-on-surface-variant">
                {nombre ? `Sesión iniciada como ${nombre}.` : 'Finaliza tu sesión actual.'}
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Icon name="logout" /> Cerrar sesión
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Cerrar sesión?"
        description="Se cerrará tu sesión actual en OptiRosse. Deberás iniciar sesión nuevamente para continuar."
        confirmLabel="Cerrar sesión"
        loading={loggingOut}
        onConfirm={async () => {
          setLoggingOut(true)
          await logout()
          setLoggingOut(false)
        }}
      />
    </div>
  )
}
