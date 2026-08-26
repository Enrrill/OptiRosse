import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { SectionCard } from '@/components/forms/SectionCard'
import { FieldError } from '@/components/forms/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLES } from '@/lib/constants/choices'
import { useCrearUsuario, useActualizarUsuario } from '../hooks/useUsuarioMutations'
import {
  ROLES_ARRAY,
  usuarioSchemaFactory,
  USUARIO_DEFAULT_VALUES,
  toUsuarioFormValues,
  toUsuarioPayload,
  type UsuarioFormValues,
} from './usuarioSchema'
import type { Usuario } from '@/types/models'

interface UsuarioFormProps {
  usuario?: Usuario | null
  onSuccess: () => void
  onCancel?: () => void
}

export function UsuarioForm({ usuario, onSuccess, onCancel }: UsuarioFormProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearUsuario()
  const actualizar = useActualizarUsuario(usuario?.id ?? null)
  const esEdicion = usuario != null

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchemaFactory(esEdicion)),
    defaultValues: usuario ? toUsuarioFormValues(usuario) : USUARIO_DEFAULT_VALUES,
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const payload = toUsuarioPayload(values, esEdicion)
      if (esEdicion) await actualizar.mutateAsync(payload)
      else await crear.mutateAsync(payload)
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            setError(field as keyof UsuarioFormValues, { message: msgs[0] })
            mapped = true
          }
        }
        if (!mapped) toast.error(apiErr.defaultMessage)
      } else {
        toast.error(apiErr.defaultMessage)
      }
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <SectionCard icon="manage_accounts" title="Cuenta">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre_usuario">Nombre de usuario</Label>
              <Input
                id="nombre_usuario"
                placeholder="usuario.optirose"
                autoComplete="username"
                {...register('nombre_usuario')}
              />
              <FieldError message={errors.nombre_usuario?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="usuario@empresa.com"
                autoComplete="email"
                {...register('correo')}
              />
              <FieldError message={errors.correo?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol">Rol</Label>
              <Controller
                control={control}
                name="rol"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_ARRAY.map((rol) => (
                        <SelectItem key={rol} value={rol}>
                          {ROLES[rol].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.rol?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">
                {esEdicion ? 'Contraseña (opcional)' : 'Contraseña'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={esEdicion ? 'Déjala vacía para mantener la actual' : 'Mínimo 8 caracteres'}
                autoComplete="new-password"
                {...register('password')}
              />
              <FieldError message={errors.password?.message} />
              <p className="text-xs text-on-surface-variant">
                {esEdicion
                  ? 'Solo se actualiza si escribes una nueva.'
                  : 'Solo se muestra al crear. Mínimo 8 caracteres.'}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="badge" title="Datos personales">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Ana" {...register('nombre')} />
              <FieldError message={errors.nombre?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" placeholder="Pérez" {...register('apellido')} />
              <FieldError message={errors.apellido?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="+58 000 000 0000" {...register('telefono')} />
              <FieldError message={errors.telefono?.message} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex-none border-t border-outline-variant/60 bg-surface-container-lowest px-6 py-4 flex items-center justify-end gap-3 z-10">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {!submitting && <Icon name="save" size={18} className="mr-1.5" />}
          {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}
