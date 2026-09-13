import { useState } from 'react'
import { User, Heart } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { FieldError } from '@/components/forms/FieldError'
import { cn } from '@/lib/utils'
import { buscarClientes } from '@/lib/api/opciones'
import { buscarPacientes } from '../hooks/useOpciones'
import type { DestinatarioSeleccion } from './pedidoSchema'

type DestinatarioTipo = 'cliente' | 'paciente'

interface DestinatarioSelectorProps {
  value: DestinatarioSeleccion | null
  onChange: (value: DestinatarioSeleccion | null) => void
  error?: string
  disabled?: boolean
}

export function DestinatarioSelector({
  value,
  onChange,
  error,
  disabled = false,
}: DestinatarioSelectorProps) {
  const [tipo, setTipo] = useState<DestinatarioTipo>(value?.tipo ?? 'cliente')

  const handleTipoChange = (nuevoTipo: DestinatarioTipo) => {
    setTipo(nuevoTipo)
    onChange(null)
  }

  const handleSelect = (data: { id: number; nombre_completo?: string; nombre_comercial?: string } | null) => {
    if (!data) {
      onChange(null)
      return
    }

    if (tipo === 'cliente') {
      onChange({
        tipo: 'cliente',
        id: data.id,
        nombre: data.nombre_comercial || '',
      })
    } else {
      onChange({
        tipo: 'paciente',
        id: data.id,
        nombre: data.nombre_completo || '',
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label>Destinatario *</Label>

      <div className="flex gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-low p-1">
        <button
          type="button"
          onClick={() => handleTipoChange('cliente')}
          disabled={disabled}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            tipo === 'cliente'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <User size={14} />
          Cliente
        </button>
        <button
          type="button"
          onClick={() => handleTipoChange('paciente')}
          disabled={disabled}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            tipo === 'paciente'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Heart size={14} />
          Paciente
        </button>
      </div>

      {tipo === 'cliente' ? (
        <SearchableSelect
          keyId="destinatario-cliente"
          value={value?.tipo === 'cliente' ? { id: value.id, nombre_comercial: value.nombre, razon_social: '' } : null}
          onChange={(data) => handleSelect(data ? { id: data.id, nombre_comercial: data.nombre_comercial } : null)}
          searchOptions={buscarClientes}
          formatSelected={(c) => c.nombre_comercial}
          placeholder="Buscar cliente por nombre o RIF..."
          disabled={disabled}
        />
      ) : (
        <SearchableSelect
          keyId="destinatario-paciente"
          value={value?.tipo === 'paciente' ? { id: value.id, nombre_completo: value.nombre } : null}
          onChange={(data) => handleSelect(data ? { id: data.id, nombre_completo: data.nombre_completo } : null)}
          searchOptions={buscarPacientes}
          formatSelected={(p) => p.nombre_completo}
          placeholder="Buscar paciente por nombre o cédula..."
          disabled={disabled}
        />
      )}

      <FieldError message={error} />
    </div>
  )
}
