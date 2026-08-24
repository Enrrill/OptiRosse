import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/data/Pagination'
import { DocumentoEmpresaCard } from './DocumentoEmpresaCard'
import { formatBytes, getFileConfig, getCategoriaBadge } from './documentoEmpresaUtils'
import type { DocumentoEmpresa } from '@/types/models'

interface DocumentosEmpresaGridProps {
  documentos: DocumentoEmpresa[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  search: string
  onSearchChange: (value: string) => void
  showInactivos: boolean
  onToggleInactivos: (value: boolean) => void
  categoriaFiltro: string
  onCategoriaChange: (value: string) => void
  extensionFiltro: string
  onExtensionChange: (value: string) => void
  canEdit: boolean
  onEdit: (documento: DocumentoEmpresa) => void
  onToggleEstado: (documento: DocumentoEmpresa) => void
  onPrevisualizar: (documento: DocumentoEmpresa) => void
  onGenerar: (documento: DocumentoEmpresa) => void
  onNuevo: () => void
}

const CATEGORIAS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todas las categorías', value: '' },
  { label: 'Institucional / Legal', value: 'institucional' },
  { label: 'Recursos Humanos', value: 'recursos_humanos' },
  { label: 'Financiero / Contable', value: 'financiero' },
  { label: 'Operativo / Taller', value: 'operativo' },
  { label: 'Otros', value: 'otro' },
]

const EXTENSIONES_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todos los formatos', value: '' },
  { label: 'Word (.docx)', value: 'docx' },
  { label: 'Excel (.xlsx)', value: 'xlsx' },
  { label: 'PDF (.pdf)', value: 'pdf' },
  { label: 'Imágenes', value: 'png' },
]

export function DocumentosEmpresaGrid({
  documentos,
  count,
  page,
  pageSize,
  onPageChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  showInactivos,
  onToggleInactivos,
  categoriaFiltro,
  onCategoriaChange,
  extensionFiltro,
  onExtensionChange,
  canEdit,
  onEdit,
  onToggleEstado,
  onPrevisualizar,
  onGenerar,
  onNuevo,
}: DocumentosEmpresaGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  return (
    <div className="space-y-5">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-outline-variant/40 bg-surface/70 p-4">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar documento por nombre o descripción..."
              className="pl-9 text-sm"
            />
          </div>

          <select
            value={categoriaFiltro}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="h-10 rounded-lg border border-outline-variant/60 bg-surface px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {CATEGORIAS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={extensionFiltro}
            onChange={(e) => onExtensionChange(e.target.value)}
            className="h-10 rounded-lg border border-outline-variant/60 bg-surface px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {EXTENSIONES_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
          <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant cursor-pointer">
            <input
              type="checkbox"
              checked={showInactivos}
              onChange={(e) => onToggleInactivos(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary/40"
            />
            Mostrar inactivos
          </label>

          <div className="flex items-center rounded-lg border border-outline-variant/60 bg-surface p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant/60 hover:text-on-surface'
              }`}
              title="Vista de cuadrícula"
            >
              <Icon name="grid_view" size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant/60 hover:text-on-surface'
              }`}
              title="Vista de lista/tabla"
            >
              <Icon name="format_list_bulleted" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-variant/20"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
          <Icon name="error" size={40} className="text-error mb-2" />
          <p className="font-semibold text-on-surface">Error al cargar los documentos</p>
          <p className="text-xs text-on-surface-variant mb-4">{errorMessage || 'Inténtalo de nuevo más tarde'}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : documentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/60 bg-surface/30 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container/40 text-secondary mb-3">
            <Icon name="folder_open" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-on-surface">No se encontraron documentos</h3>
          <p className="text-sm text-on-surface-variant max-w-md mt-1 mb-4">
            No hay archivos subidos que coincidan con los filtros seleccionados.
          </p>
          {canEdit && (
            <Button onClick={onNuevo} className="gap-2">
              <Icon name="cloud_upload" size={18} /> Subir primer documento
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documentos.map((doc) => (
            <DocumentoEmpresaCard
              key={doc.id}
              documento={doc}
              canEdit={canEdit}
              onEdit={onEdit}
              onToggleEstado={onToggleEstado}
              onPrevisualizar={onPrevisualizar}
              onGenerar={onGenerar}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-outline-variant/40 bg-surface-variant/30 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Versión</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {documentos.map((doc) => {
                const fConfig = getFileConfig(doc.extension)
                const cConfig = getCategoriaBadge(doc.categoria)
                return (
                  <tr key={doc.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fConfig.iconBg}`}>
                          <Icon name={fConfig.icon} size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface line-clamp-1">{doc.nombre}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-1">
                            {doc.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cConfig.class}`}>
                        {cConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">v{doc.version}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{formatBytes(doc.tamano_bytes)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {doc.es_plantilla_generable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => onGenerar(doc)}
                            title="Generar Documento"
                          >
                            <Icon name="auto_fix_high" size={16} />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (doc.archivo_url) window.open(doc.archivo_url, '_blank')
                          }}
                          title="Descargar Original"
                        >
                          <Icon name="download" size={16} />
                        </Button>

                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(doc)}
                              title="Editar"
                            >
                              <Icon name="edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={doc.activo ? 'text-error' : 'text-success'}
                              onClick={() => onToggleEstado(doc)}
                              title={doc.activo ? 'Desactivar' : 'Reactivar'}
                            >
                              <Icon name={doc.activo ? 'block' : 'check_circle'} size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
    </div>
  )
}
