import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/Icon'
import { documentoEmpresaSchema, type DocumentoEmpresaFormValues } from './documentoEmpresaSchema'
import { useCrearDocumentoEmpresa, useActualizarDocumentoEmpresa } from '../hooks/useDocumentoEmpresaMutations'
import type { CategoriaDocumentoEmpresa, DocumentoEmpresa, VariableSchemaItem } from '@/types/models'
import { formatBytes } from './documentoEmpresaUtils'

interface DocumentoEmpresaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documento?: DocumentoEmpresa | null
}

const CATEGORIAS_LIST: { label: string; value: CategoriaDocumentoEmpresa }[] = [
  { label: 'Institucional / Legal', value: 'institucional' },
  { label: 'Recursos Humanos', value: 'recursos_humanos' },
  { label: 'Financiero / Contable', value: 'financiero' },
  { label: 'Operativo / Taller', value: 'operativo' },
  { label: 'Otros', value: 'otro' },
]

export function DocumentoEmpresaFormDialog({
  open,
  onOpenChange,
  documento,
}: DocumentoEmpresaFormDialogProps) {
  const isEditing = !!documento
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [variables, setVariables] = useState<VariableSchemaItem[]>([])

  // Track previous open state to init once per open, without calling setState in effect body
  const prevOpenRef = useRef(false)
  const crearMutation = useCrearDocumentoEmpresa()
  const actualizarMutation = useActualizarDocumentoEmpresa(documento?.id ?? null)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<DocumentoEmpresaFormValues>({
    resolver: zodResolver(documentoEmpresaSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: 'institucional',
      version: '1.0',
      es_plantilla_generable: false,
    },
  })

  const esPlantillaGenerable = useWatch({ control, name: 'es_plantilla_generable', defaultValue: false })

  // Sync form values when dialog opens/closes
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (documento) {
        reset({
          nombre: documento.nombre,
          descripcion: documento.descripcion || '',
          categoria: documento.categoria,
          version: documento.version,
          es_plantilla_generable: documento.es_plantilla_generable,
        })
        const schema = documento.variables_schema || []
        setTimeout(() => setVariables(schema), 0)
      } else {
        reset({
          nombre: '',
          descripcion: '',
          categoria: 'institucional',
          version: '1.0',
          es_plantilla_generable: false,
        })
        setTimeout(() => setVariables([]), 0)
      }
      setSelectedFile(null)
    }
    prevOpenRef.current = open
  }, [open, documento, reset])



  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (!getValues('nombre')) {
        setValue('nombre', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!getValues('nombre')) {
        setValue('nombre', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const agregarVariable = () => {
    setVariables((prev) => [
      ...prev,
      { clave: '', etiqueta: '', tipo: 'texto', requerido: true },
    ])
  }

  const eliminarVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index))
  }

  const actualizarVariable = (index: number, field: keyof VariableSchemaItem, value: unknown) => {
    setVariables((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const onSubmit = async (values: DocumentoEmpresaFormValues) => {
    const formData = new FormData()
    formData.append('nombre', values.nombre)
    formData.append('descripcion', values.descripcion || '')
    formData.append('categoria', values.categoria)
    formData.append('version', values.version)
    formData.append('es_plantilla_generable', String(values.es_plantilla_generable))

    if (values.es_plantilla_generable && variables.length > 0) {
      formData.append('variables_schema', JSON.stringify(variables))
    } else {
      formData.append('variables_schema', JSON.stringify([]))
    }

    if (selectedFile) {
      formData.append('archivo', selectedFile)
    }

    try {
      if (isEditing) {
        await actualizarMutation.mutateAsync(formData)
      } else {
        await crearMutation.mutateAsync(formData)
      }
      onOpenChange(false)
    } catch {
      // Manejado por interceptor/mutation toast
    }
  }

  const isLoading = crearMutation.isPending || actualizarMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name={isEditing ? 'edit' : 'cloud_upload'} className="text-primary" />
            {isEditing ? 'Editar Documento' : 'Subir Nuevo Documento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Zona de Carga de Archivo */}
          <div>
            <Label className="mb-1.5 block text-sm font-semibold">
              Archivo adjunto {!isEditing && <span className="text-error">*</span>}
            </Label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-outline-variant/60 bg-surface-variant/20 hover:border-primary/40'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip"
              />

              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Icon name="check_circle" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-on-surface line-clamp-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-error"
                    onClick={() => setSelectedFile(null)}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                    <Icon name="cloud_upload" size={28} />
                  </div>
                  <p className="text-sm font-medium text-on-surface">
                    {isEditing ? 'Haz clic para reemplazar el archivo' : 'Arrastra un archivo aquí o haz clic para buscar'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Formatos permitidos: Word (.docx), Excel (.xlsx), PDF, PNG, JPG (máx. 15 MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nombre" className="text-sm font-semibold">
                Nombre del Documento <span className="text-error">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Constancia de Trabajo, RIF 2026..."
                className="mt-1"
              />
              {errors.nombre && <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="categoria" className="text-sm font-semibold">
                Categoría <span className="text-error">*</span>
              </Label>
              <select
                id="categoria"
                {...register('categoria')}
                className="mt-1 h-10 w-full rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CATEGORIAS_LIST.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Versión y Switch Plantilla Generable */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
            <div>
              <Label htmlFor="version" className="text-sm font-semibold">
                Versión <span className="text-error">*</span>
              </Label>
              <Input id="version" {...register('version')} placeholder="1.0" className="mt-1 font-mono text-sm" />
              {errors.version && <p className="mt-1 text-xs text-error">{errors.version.message}</p>}
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('es_plantilla_generable')}
                  className="rounded border-outline-variant text-primary focus:ring-primary/40 h-4 w-4"
                />
                <div>
                  <span className="text-sm font-semibold text-on-surface">Es plantilla Word generable (.docx)</span>
                  <p className="text-xs text-on-surface-variant">Permite inyectar variables Jinja2 con docxtpl</p>
                </div>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion" className="text-sm font-semibold">
              Descripción u Observaciones
            </Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Detalles acerca de este documento o su uso dentro de la compañía..."
              className="mt-1 text-sm min-h-[70px]"
            />
          </div>

          {/* Editor de Variables de la Plantilla */}
          {esPlantillaGenerable && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <Icon name="auto_fix_high" size={18} /> Variables de la Plantilla Word
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Define los campos Jinja2 que el usuario rellenará al generar este documento (ej: {'{{ nombre_empleado }}'})
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={agregarVariable} className="gap-1">
                  <Icon name="add" size={16} /> Variable
                </Button>
              </div>

              {variables.length === 0 ? (
                <p className="text-xs text-on-surface-variant/70 italic text-center py-2">
                  No has configurado variables requeridas. El usuario podrá enviar un diccionario de datos libre.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {variables.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface p-2">
                      <Input
                        placeholder="clave (ej: nombre)"
                        value={v.clave}
                        onChange={(e) => actualizarVariable(idx, 'clave', e.target.value)}
                        className="h-8 text-xs font-mono flex-1"
                      />
                      <Input
                        placeholder="Etiqueta visible"
                        value={v.etiqueta}
                        onChange={(e) => actualizarVariable(idx, 'etiqueta', e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <select
                        value={v.tipo || 'texto'}
                        onChange={(e) => actualizarVariable(idx, 'tipo', e.target.value)}
                        className="h-8 rounded-md border border-outline-variant/60 bg-surface px-2 text-xs text-on-surface"
                      >
                        <option value="texto">Texto</option>
                        <option value="fecha">Fecha</option>
                        <option value="numero">Número</option>
                        <option value="textarea">Texto largo</option>
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-error hover:bg-error/10"
                        onClick={() => eliminarVariable(idx)}
                      >
                        <Icon name="delete" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-outline-variant/30">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Icon name={isEditing ? 'save' : 'cloud_upload'} size={18} />
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Subir Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
