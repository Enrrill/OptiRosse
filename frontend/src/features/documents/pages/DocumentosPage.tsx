import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/data/PageHeader'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { usePagination } from '@/hooks/usePagination'
import { usePlantillas } from '../hooks/usePlantillas'
import { useDocumentosEmpresa } from '../hooks/useDocumentosEmpresa'
import {
  useDesactivarPlantilla,
  useReactivarPlantilla,
} from '../hooks/usePlantillaMutations'
import {
  useDesactivarDocumentoEmpresa,
  useReactivarDocumentoEmpresa,
} from '../hooks/useDocumentoEmpresaMutations'
import { PlantillasTable } from '../components/PlantillasTable'
import { DocumentosEmpresaGrid } from '../components/DocumentosEmpresaGrid'
import { PlantillaFormDialog } from '../components/PlantillaFormDialog'
import { DocumentoEmpresaFormDialog } from '../components/DocumentoEmpresaFormDialog'
import { GenerarDocxDialog } from '../components/GenerarDocxDialog'
import type {
  CategoriaDocumentoEmpresa,
  DocumentoEmpresa,
  PlantillaDocumento,
  RolUsuario,
  TipoDocumento,
} from '@/types/models'
import { puedeGenerarDocumentos } from '@/lib/constants/permissions'

const ROLES_ESCRITURA: RolUsuario[] = ['administrador']

type TabId = 'empresa' | 'sistema'

interface TabConfig {
  id: TabId
  label: string
  icon: string
  description: string
}

const TABS: TabConfig[] = [
  {
    id: 'empresa',
    label: 'Archivos de la Empresa',
    icon: 'business',
    description: 'RIF, constancias, contratos y plantillas Word/Excel de la compañía',
  },
  {
    id: 'sistema',
    label: 'Plantillas del Sistema',
    icon: 'receipt_long',
    description: 'Facturas, órdenes de trabajo, notas de entrega y recibos de pago',
  },
]

export default function DocumentosPage() {
  // ── Estado de Tabs ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('empresa')

  // ── Auth ───────────────────────────────────────────────────────────────────
  const rol = useAuthStore((s) => s.user?.rol)
  const canEdit = !!rol && ROLES_ESCRITURA.includes(rol)

  // ── Tab: Archivos de Empresa ───────────────────────────────────────────────
  const paginationEmpresa = usePagination()
  const [showInactivosEmpresa, setShowInactivosEmpresa] = useState(false)
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [extensionFiltro, setExtensionFiltro] = useState('')
  const [formEmpresaOpen, setFormEmpresaOpen] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<DocumentoEmpresa | null>(null)
  const [estadoTargetEmpresa, setEstadoTargetEmpresa] = useState<DocumentoEmpresa | null>(null)
  const [generarTarget, setGenerarTarget] = useState<DocumentoEmpresa | null>(null)

  const paramsEmpresa = useMemo(() => {
    const p: Record<string, unknown> = { ...paginationEmpresa.params }
    if (showInactivosEmpresa) p.activo = 'false'
    if (categoriaFiltro) p.categoria = categoriaFiltro as CategoriaDocumentoEmpresa
    if (extensionFiltro) p.extension = extensionFiltro
    return p
  }, [paginationEmpresa.params, showInactivosEmpresa, categoriaFiltro, extensionFiltro])

  const {
    documentos,
    count: countEmpresa,
    isLoading: isLoadingEmpresa,
    isError: isErrorEmpresa,
    error: errorEmpresa,
    refetch: refetchEmpresa,
  } = useDocumentosEmpresa(paramsEmpresa)

  const desactivarEmpresa = useDesactivarDocumentoEmpresa(estadoTargetEmpresa?.id ?? null)
  const reactivarEmpresa = useReactivarDocumentoEmpresa(estadoTargetEmpresa?.id ?? null)

  const confirmarToggleEstadoEmpresa = async () => {
    if (!estadoTargetEmpresa) return
    try {
      if (estadoTargetEmpresa.activo) await desactivarEmpresa.mutateAsync()
      else await reactivarEmpresa.mutateAsync({ activo: true })
      setEstadoTargetEmpresa(null)
    } catch {
      setEstadoTargetEmpresa(null)
    }
  }

  const abrirNuevoEmpresa = () => {
    setEditingEmpresa(null)
    setFormEmpresaOpen(true)
  }

  const abrirEdicionEmpresa = (documento: DocumentoEmpresa) => {
    setEditingEmpresa(documento)
    setFormEmpresaOpen(true)
  }

  // ── Tab: Plantillas del Sistema ────────────────────────────────────────────
  const paginacionSistema = usePagination()
  const [showInactivosSistema, setShowInactivosSistema] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [formSistemaOpen, setFormSistemaOpen] = useState(false)
  const [editingSistema, setEditingSistema] = useState<PlantillaDocumento | null>(null)
  const [estadoTargetSistema, setEstadoTargetSistema] = useState<PlantillaDocumento | null>(null)

  const paramsSistema = useMemo(() => {
    const p: Record<string, unknown> = { ...paginacionSistema.params }
    if (showInactivosSistema) p.activo = 'false'
    if (tipoFiltro && tipoFiltro !== 'todos') p.tipo_documento = tipoFiltro as TipoDocumento
    return p
  }, [paginacionSistema.params, showInactivosSistema, tipoFiltro])

  const {
    plantillas,
    count: countSistema,
    isLoading: isLoadingSistema,
    isError: isErrorSistema,
    error: errorSistema,
    refetch: refetchSistema,
  } = usePlantillas(paramsSistema)

  const desactivarSistema = useDesactivarPlantilla(estadoTargetSistema?.id ?? null)
  const reactivarSistema = useReactivarPlantilla(estadoTargetSistema?.id ?? null)

  const confirmarToggleEstadoSistema = async () => {
    if (!estadoTargetSistema) return
    try {
      if (estadoTargetSistema.activo) await desactivarSistema.mutateAsync()
      else await reactivarSistema.mutateAsync({ activo: true })
      setEstadoTargetSistema(null)
    } catch {
      setEstadoTargetSistema(null)
    }
  }

  const abrirNuevoSistema = () => {
    setEditingSistema(null)
    setFormSistemaOpen(true)
  }

  const abrirEdicionSistema = (plantilla: PlantillaDocumento) => {
    setEditingSistema(plantilla)
    setFormSistemaOpen(true)
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const esInactivoEmpresa = estadoTargetEmpresa != null && !estadoTargetEmpresa.activo
  const nombreDocEmpresa = estadoTargetEmpresa?.nombre || 'este documento'
  const esInactivoSistema = estadoTargetSistema != null && !estadoTargetSistema.activo
  const nombrePlantillaSistema = estadoTargetSistema?.nombre || 'esta plantilla'

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Gestión de archivos institucionales, plantillas Word/Excel y plantillas de documentos del sistema."
        actions={
          canEdit ? (
            activeTab === 'empresa' ? (
              <Button onClick={abrirNuevoEmpresa}>
                <Icon name="cloud_upload" size={18} /> Subir Documento
              </Button>
            ) : (
              <Button onClick={abrirNuevoSistema}>
                <Icon name="add" size={18} /> Nueva Plantilla
              </Button>
            )
          ) : undefined
        }
      />

      {/* ── Sistema de Tabs ──────────────────────────────────────────────── */}
      <div className="mb-6 space-y-2">
        <div className="flex gap-1.5 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-1.5 shadow-xs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon name={tab.icon} size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'empresa' ? 'Empresa' : 'Sistema'}
              </span>
              {activeTab === tab.id && (
                <span className="ml-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-mono font-medium text-primary">
                  {tab.id === 'empresa' ? countEmpresa : countSistema}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="px-1 text-xs text-on-surface-variant/80">
          {TABS.find((t) => t.id === activeTab)?.description}
        </p>
      </div>

      {/* ── Contenido de Tabs ────────────────────────────────────────────── */}
      {activeTab === 'empresa' && (
        <DocumentosEmpresaGrid
          documentos={documentos}
          count={countEmpresa}
          page={paginationEmpresa.page}
          pageSize={paginationEmpresa.pageSize}
          onPageChange={paginationEmpresa.setPage}
          isLoading={isLoadingEmpresa}
          isError={isErrorEmpresa}
          errorMessage={errorEmpresa?.defaultMessage}
          onRetry={() => refetchEmpresa()}
          search={paginationEmpresa.search}
          onSearchChange={(value) => {
            paginationEmpresa.setSearch(value)
            paginationEmpresa.resetPage()
          }}
          showInactivos={showInactivosEmpresa}
          onToggleInactivos={(value) => {
            setShowInactivosEmpresa(value)
            paginationEmpresa.resetPage()
          }}
          categoriaFiltro={categoriaFiltro}
          onCategoriaChange={(value) => {
            setCategoriaFiltro(value)
            paginationEmpresa.resetPage()
          }}
          extensionFiltro={extensionFiltro}
          onExtensionChange={(value) => {
            setExtensionFiltro(value)
            paginationEmpresa.resetPage()
          }}
          canEdit={canEdit}
          onEdit={abrirEdicionEmpresa}
          onToggleEstado={setEstadoTargetEmpresa}
          onPrevisualizar={(documento) => {
            if (documento.archivo_url) window.open(documento.archivo_url, '_blank')
          }}
          onGenerar={setGenerarTarget}
          onNuevo={abrirNuevoEmpresa}
        />
      )}

      {activeTab === 'sistema' && (
        <>
          <PlantillasTable
            plantillas={plantillas}
            count={countSistema}
            page={paginacionSistema.page}
            pageSize={paginacionSistema.pageSize}
            onPageChange={paginacionSistema.setPage}
            isLoading={isLoadingSistema}
            isError={isErrorSistema}
            errorMessage={errorSistema?.defaultMessage}
            onRetry={() => refetchSistema()}
            search={paginacionSistema.search}
            onSearchChange={(value) => {
              paginacionSistema.setSearch(value)
              paginacionSistema.resetPage()
            }}
            showInactivos={showInactivosSistema}
            onToggleInactivos={(value) => {
              setShowInactivosSistema(value)
              paginacionSistema.resetPage()
            }}
            tipoFiltro={tipoFiltro}
            onTipoChange={(value) => {
              setTipoFiltro(value)
              paginacionSistema.resetPage()
            }}
            canEdit={canEdit}
            onEdit={abrirEdicionSistema}
            onToggleEstado={setEstadoTargetSistema}
            onNuevo={abrirNuevoSistema}
          />

          {puedeGenerarDocumentos(rol) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-secondary-container/40 bg-secondary-container/10 px-4 py-3 text-sm text-on-surface">
              <Icon name="lightbulb" size={18} className="text-secondary" />
              <span>
                Genera documentos desde el detalle de un <b>pedido</b> (factura, orden de trabajo, nota
                de entrega) o de un <b>pago</b> (recibo).
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Modales de Empresa ───────────────────────────────────────────── */}
      <DocumentoEmpresaFormDialog
        open={formEmpresaOpen}
        onOpenChange={setFormEmpresaOpen}
        documento={editingEmpresa}
      />

      <GenerarDocxDialog
        open={generarTarget !== null}
        onOpenChange={(open) => {
          if (!open) setGenerarTarget(null)
        }}
        documento={generarTarget}
      />

      <ConfirmDialog
        open={estadoTargetEmpresa != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTargetEmpresa(null)
        }}
        title={esInactivoEmpresa ? '¿Reactivar este documento?' : '¿Desactivar este documento?'}
        description={
          esInactivoEmpresa
            ? `"${nombreDocEmpresa}" volverá a estar disponible.`
            : `"${nombreDocEmpresa}" no estará disponible para descarga. El archivo se conserva y puede reactivarse.`
        }
        confirmLabel={esInactivoEmpresa ? 'Reactivar' : 'Desactivar'}
        variant={esInactivoEmpresa ? 'default' : 'destructive'}
        loading={desactivarEmpresa.isPending || reactivarEmpresa.isPending}
        onConfirm={confirmarToggleEstadoEmpresa}
      />

      {/* ── Modales de Sistema ───────────────────────────────────────────── */}
      <PlantillaFormDialog
        open={formSistemaOpen}
        onOpenChange={setFormSistemaOpen}
        plantilla={editingSistema}
      />

      <ConfirmDialog
        open={estadoTargetSistema != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTargetSistema(null)
        }}
        title={esInactivoSistema ? '¿Reactivar esta plantilla?' : '¿Desactivar esta plantilla?'}
        description={
          esInactivoSistema
            ? `${nombrePlantillaSistema} volverá a estar disponible para generar documentos.`
            : `${nombrePlantillaSistema} dejará de poder usarse para generar documentos. La plantilla se conserva y puede reactivarse.`
        }
        confirmLabel={esInactivoSistema ? 'Reactivar' : 'Desactivar'}
        variant={esInactivoSistema ? 'default' : 'destructive'}
        loading={desactivarSistema.isPending || reactivarSistema.isPending}
        onConfirm={confirmarToggleEstadoSistema}
      />
    </div>
  )
}