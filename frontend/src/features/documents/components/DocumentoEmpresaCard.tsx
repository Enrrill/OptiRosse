import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import type { DocumentoEmpresa } from '@/types/models'
import { formatBytes, getFileConfig, getCategoriaBadge } from './documentoEmpresaUtils'

interface DocumentoEmpresaCardProps {
  documento: DocumentoEmpresa
  canEdit: boolean
  onEdit: (documento: DocumentoEmpresa) => void
  onToggleEstado: (documento: DocumentoEmpresa) => void
  onPrevisualizar: (documento: DocumentoEmpresa) => void
  onGenerar: (documento: DocumentoEmpresa) => void
}

export function DocumentoEmpresaCard({
  documento,
  canEdit,
  onEdit,
  onToggleEstado,
  onPrevisualizar,
  onGenerar,
}: DocumentoEmpresaCardProps) {
  const [downloading, setDownloading] = useState(false)
  const fileConfig = getFileConfig(documento.extension)
  const catConfig = getCategoriaBadge(documento.categoria)

  const handleDownloadOriginal = () => {
    if (!documento.archivo_url) return
    setDownloading(true)
    const a = document.createElement('a')
    a.href = documento.archivo_url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = `${documento.nombre}.${documento.extension}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => setDownloading(false), 1000)
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${
        documento.activo
          ? 'border-outline-variant/60 bg-surface hover:border-primary/40'
          : 'border-outline-variant/30 bg-surface/50 opacity-60'
      }`}
    >
      <div>
        {/* Superior: Icono de extensión + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${fileConfig.iconBg}`}>
            <Icon name={fileConfig.icon} size={26} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${fileConfig.badgeBg}`}>
              {fileConfig.label}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${catConfig.class}`}>
              {catConfig.label}
            </span>
            {!documento.activo && (
              <span className="inline-flex items-center rounded-full border border-error/30 bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Info Principal */}
        <div className="mt-4">
          <h3 className="line-clamp-1 text-base font-semibold text-on-surface group-hover:text-primary">
            {documento.nombre}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-on-surface-variant/80">
            {documento.descripcion || 'Sin descripción adicional.'}
          </p>
        </div>
      </div>

      {/* Footer Info & Acciones */}
      <div className="mt-5 pt-3 border-t border-outline-variant/30">
        <div className="flex items-center justify-between text-xs text-on-surface-variant/70 mb-3">
          <span className="flex items-center gap-1 font-mono">
            <Icon name="tag" size={14} /> v{documento.version}
          </span>
          <span>{formatBytes(documento.tamano_bytes)}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {documento.es_plantilla_generable && (
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onGenerar(documento)}
              >
                <Icon name="auto_fix_high" size={15} /> Generar
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleDownloadOriginal}
              disabled={downloading || !documento.archivo_url}
              title="Descargar archivo original"
            >
              <Icon name="download" size={15} /> Descargar
            </Button>

            {['pdf', 'png', 'jpg', 'jpeg'].includes(documento.extension.toLowerCase()) && (
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => onPrevisualizar(documento)}
                title="Vista previa"
              >
                <Icon name="visibility" size={16} />
              </Button>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(documento)}
                title="Editar metadatos"
              >
                <Icon name="edit" size={16} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${documento.activo ? 'text-error hover:bg-error/10' : 'text-success hover:bg-success/10'}`}
                onClick={() => onToggleEstado(documento)}
                title={documento.activo ? 'Desactivar' : 'Reactivar'}
              >
                <Icon name={documento.activo ? 'block' : 'check_circle'} size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
