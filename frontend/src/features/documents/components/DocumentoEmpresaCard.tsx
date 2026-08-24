import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

  const isPreviewable = ['pdf', 'png', 'jpg', 'jpeg'].includes(documento.extension.toLowerCase())

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 ${
        documento.activo
          ? 'border-outline-variant/70 bg-surface-container-lowest shadow-xs hover:border-primary/40 hover:shadow-md'
          : 'border-outline-variant/40 bg-surface-container-lowest/60 opacity-65 hover:opacity-100'
      }`}
    >
      <div>
        {/* Superior: Icono de extensión + Badges */}
        <div className="flex items-start justify-between gap-2.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${fileConfig.iconBg}`}
          >
            <Icon name={fileConfig.icon} size={24} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${fileConfig.badgeBg}`}
            >
              {fileConfig.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${catConfig.class}`}
            >
              {catConfig.label}
            </span>
            {!documento.activo && (
              <span className="inline-flex items-center rounded-full border border-error-container/40 bg-error-container/20 px-2 py-0.5 text-xs font-medium text-error">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Info Principal */}
        <div className="mt-3.5">
          <h3 className="line-clamp-1 text-base font-semibold text-on-surface transition-colors group-hover:text-primary">
            {documento.nombre}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-on-surface-variant">
            {documento.descripcion || 'Sin descripción adicional.'}
          </p>
        </div>
      </div>

      {/* Footer Info & Acciones */}
      <div className="mt-4 pt-3 border-t border-outline-variant/30">
        <div className="flex items-center justify-between text-xs text-on-surface-variant/80 mb-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Icon name="tag" size={13} /> v{documento.version}
          </span>
          <span className="font-mono text-[11px]">{formatBytes(documento.tamano_bytes)}</span>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="flex items-center justify-between gap-2">
            {/* Acción Primaria (Botón con Texto) */}
            <div>
              {documento.es_plantilla_generable ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5 text-xs h-8 px-3"
                      onClick={() => onGenerar(documento)}
                    >
                      <Icon name="auto_fix_high" size={15} /> Generar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generar archivo Word con datos</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8 px-3"
                      onClick={handleDownloadOriginal}
                      disabled={downloading || !documento.archivo_url}
                    >
                      <Icon name="download" size={15} /> Descargar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Descargar documento original</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Grupo de Acciones Secundarias (Iconos) */}
            <div className="flex items-center gap-0.5">
              {documento.es_plantilla_generable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                      onClick={handleDownloadOriginal}
                      disabled={downloading || !documento.archivo_url}
                    >
                      <Icon name="download" size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Descargar plantilla original</TooltipContent>
                </Tooltip>
              )}

              {isPreviewable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                      onClick={() => onPrevisualizar(documento)}
                    >
                      <Icon name="visibility" size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Abrir vista previa</TooltipContent>
                </Tooltip>
              )}

              {canEdit && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                        onClick={() => onEdit(documento)}
                      >
                        <Icon name="edit" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar metadatos</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          documento.activo
                            ? 'text-error hover:bg-error-container/20'
                            : 'text-success hover:bg-success-container/20'
                        }`}
                        onClick={() => onToggleEstado(documento)}
                      >
                        <Icon name={documento.activo ? 'visibility_off' : 'restart_alt'} size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{documento.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}


