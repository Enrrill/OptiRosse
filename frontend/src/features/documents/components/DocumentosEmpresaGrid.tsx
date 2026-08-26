import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { EmptyState } from '@/components/data/EmptyState'
import { ErrorState } from '@/components/data/ErrorState'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Pagination } from '@/components/data/Pagination'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DocumentoEmpresaCard } from './DocumentoEmpresaCard'
import { formatBytes, getFileConfig, getCategoriaBadge } from './documentoEmpresaUtils'
import { estadoActivo } from '@/lib/constants/choices'
import type { DocumentoEmpresa } from '@/types/models'
import type { ActiveFilterItem } from '@/components/filters/ActiveFilterChips'

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
  { label: 'Institucional / Legal', value: 'institucional' },
  { label: 'Recursos Humanos', value: 'recursos_humanos' },
  { label: 'Financiero / Contable', value: 'financiero' },
  { label: 'Operativo / Taller', value: 'operativo' },
  { label: 'Otros', value: 'otro' },
]

const EXTENSIONES_OPTIONS: { label: string; value: string }[] = [
  { label: 'Word (.docx)', value: 'docx' },
  { label: 'Excel (.xlsx)', value: 'xlsx' },
  { label: 'PDF (.pdf)', value: 'pdf' },
  { label: 'Imágenes (PNG/JPG)', value: 'png' },
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

  const hayFiltros = search !== '' || categoriaFiltro !== '' || extensionFiltro !== '' || showInactivos
  const activeCount = (categoriaFiltro ? 1 : 0) + (extensionFiltro ? 1 : 0)

  const activeFiltersList: ActiveFilterItem[] = [
    categoriaFiltro
      ? {
          id: 'categoria',
          label: 'Categoría',
          valueDisplay:
            CATEGORIAS_OPTIONS.find((c) => c.value === categoriaFiltro)?.label || categoriaFiltro,
          onRemove: () => onCategoriaChange(''),
        }
      : null,
    extensionFiltro
      ? {
          id: 'extension',
          label: 'Formato',
          valueDisplay:
            EXTENSIONES_OPTIONS.find((e) => e.value === extensionFiltro)?.label || extensionFiltro,
          onRemove: () => onExtensionChange(''),
        }
      : null,
  ].filter(Boolean) as ActiveFilterItem[]

  const handleClearFilters = () => {
    onCategoriaChange('')
    onExtensionChange('')
  }

  // Columnas para DataTable cuando viewMode === 'table'
  const tableColumns: Column<DocumentoEmpresa>[] = [
    {
      key: 'nombre',
      header: 'Documento',
      cell: (doc) => {
        const fConfig = getFileConfig(doc.extension)
        return (
          <div className="flex items-center gap-3 py-0.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fConfig.iconBg}`}
            >
              <Icon name={fConfig.icon} size={20} />
            </div>
            <div>
              <p className="font-semibold text-on-surface line-clamp-1">{doc.nombre}</p>
              <p className="text-xs text-on-surface-variant line-clamp-1">
                {doc.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (doc) => {
        const cConfig = getCategoriaBadge(doc.categoria)
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cConfig.class}`}
          >
            {cConfig.label}
          </span>
        )
      },
    },
    {
      key: 'version',
      header: 'Versión',
      cell: (doc) => <span className="font-mono text-xs text-on-surface-variant">v{doc.version}</span>,
    },
    {
      key: 'tamano_bytes',
      header: 'Tamaño',
      cell: (doc) => (
        <span className="font-mono text-xs text-on-surface-variant">
          {formatBytes(doc.tamano_bytes)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (doc) => <StatusBadge display={estadoActivo(doc.activo)} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider delayDuration={150}>
            {doc.es_plantilla_generable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10"
                    onClick={() => onGenerar(doc)}
                  >
                    <Icon name="auto_fix_high" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generar documento</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (doc.archivo_url) window.open(doc.archivo_url, '_blank')
                  }}
                >
                  <Icon name="download" size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar original</TooltipContent>
            </Tooltip>

            {['pdf', 'png', 'jpg', 'jpeg'].includes(doc.extension.toLowerCase()) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onPrevisualizar(doc)}>
                    <Icon name="visibility" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vista previa</TooltipContent>
              </Tooltip>
            )}

            {canEdit && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(doc)}>
                      <Icon name="edit" size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar metadatos</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        doc.activo
                          ? 'text-error hover:bg-error-container/20'
                          : 'text-success hover:bg-success-container/20'
                      }
                      onClick={() => onToggleEstado(doc)}
                    >
                      <Icon name={doc.activo ? 'visibility_off' : 'restart_alt'} size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{doc.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      ),
    },
  ]

  const toolbarComponent = (
    <DataTableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar documento por nombre o descripción..."
      searchId="search-documentos-empresa"
      quickFilters={
        <div className="flex items-center gap-2">
          <FilterChip
            id="toggle-inactivos-empresa"
            checked={showInactivos}
            onCheckedChange={onToggleInactivos}
          />
          {/* Segmented view mode toggle */}
          <div className="flex h-8 items-center rounded-lg border border-outline-variant/70 bg-surface-container-low p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/50'
              }`}
              title="Vista de cuadrícula"
            >
              <Icon name="grid_view" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${
                viewMode === 'table'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/50'
              }`}
              title="Vista de lista/tabla"
            >
              <Icon name="format_list_bulleted" size={16} />
            </button>
          </div>
        </div>
      }
      activeFilterCount={activeCount}
      activeFilters={activeFiltersList}
      onClearFilters={handleClearFilters}
      filterContent={
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">Categoría</label>
            <Select value={categoriaFiltro || 'todas'} onValueChange={(val) => onCategoriaChange(val === 'todas' ? '' : val)}>
              <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {CATEGORIAS_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">Formato de Archivo</label>
            <Select value={extensionFiltro || 'todos'} onValueChange={(val) => onExtensionChange(val === 'todos' ? '' : val)}>
              <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                <SelectValue placeholder="Todos los formatos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los formatos</SelectItem>
                {EXTENSIONES_OPTIONS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    />
  )

  if (viewMode === 'table') {
    return (
      <DataTable<DocumentoEmpresa>
        columns={tableColumns}
        data={documentos}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? (errorMessage ?? 'Error al cargar los documentos') : null}
        onRetry={onRetry}
        emptyTitle={hayFiltros ? 'No hay documentos con estos filtros' : 'No hay documentos'}
        emptyDescription={
          canEdit
            ? 'Sube el primer documento institucional o plantilla Word/Excel de la empresa.'
            : 'Aún no se han subido documentos de la empresa.'
        }
        emptyAction={
          canEdit ? (
            <Button onClick={onNuevo} className="gap-2">
              <Icon name="cloud_upload" size={18} /> Subir documento
            </Button>
          ) : undefined
        }
        toolbar={toolbarComponent}
        footer={
          <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar Card Container */}
      <div className="overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-xs">
        {toolbarComponent}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-outline-variant/40 bg-surface-container-high/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-xs">
          <ErrorState message={errorMessage || 'Error al cargar los documentos'} onRetry={onRetry} />
        </div>
      ) : documentos.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-xs">
          <EmptyState
            title={hayFiltros ? 'No hay documentos con estos filtros' : 'No se encontraron documentos'}
            description={
              hayFiltros
                ? 'Prueba a ajustar o limpiar los filtros seleccionados.'
                : 'No hay archivos subidos en esta sección de la compañía.'
            }
            icon="folder_open"
            action={
              canEdit && !hayFiltros ? (
                <Button onClick={onNuevo} className="gap-2">
                  <Icon name="cloud_upload" size={18} /> Subir primer documento
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
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

          <div className="mt-5">
            <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
          </div>
        </>
      )}
    </div>
  )
}


