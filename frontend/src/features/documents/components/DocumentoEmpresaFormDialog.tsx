import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/Icon'
import { documentoEmpresaSchema, type DocumentoEmpresaFormValues } from './documentoEmpresaSchema'
import { useCrearDocumentoEmpresa, useActualizarDocumentoEmpresa } from '../hooks/useDocumentoEmpresaMutations'
import type { CategoriaDocumentoEmpresa, DocumentoEmpresa, VariableSchemaItem } from '@/types/models'
import { formatBytes, getFileConfig } from './documentoEmpresaUtils'

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-heading text-on-surface">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name={isEditing ? 'edit_document' : 'cloud_upload'} size={22} />
            </div>
            {isEditing ? 'Editar Documento' : 'Subir Nuevo Documento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Zona de Carga de Archivo */}
          <div>
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
              Archivo Adjunto {!isEditing && <span className="text-error">*</span>}
            </Label>

            {selectedFile ? (
              (() => {
                const ext = selectedFile.name.split('.').pop() || ''
                const config = getFileConfig(ext)
                return (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/60 p-3.5 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
                        <Icon name={config.icon} size={24} />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-on-surface truncate">
                            {selectedFile.name}
                          </p>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${config.badgeBg}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          {formatBytes(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error-container/20 hover:text-error shrink-0 gap-1 rounded-lg text-xs"
                      onClick={() => setSelectedFile(null)}
                    >
                      <Icon name="close" size={16} />
                      Cambiar
                    </Button>
                  </div>
                )
              })()
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2.5 shadow-xs group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
                    <Icon name="cloud_upload" size={26} />
                  </div>
                  <p className="text-sm font-semibold text-on-surface">
                    {isEditing ? 'Haz clic para reemplazar el archivo' : 'Arrastra un archivo aquí o haz clic para buscar'}
                  </p>
                  <p className="text-xs text-on-surface-variant/80 mt-1">
                    Formatos permitidos: Word (.docx), Excel (.xlsx), PDF, PNG, JPG (máx. 15 MB)
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Nombre del Documento */}
          <div>
            <Label htmlFor="nombre" className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
              Nombre del Documento <span className="text-error">*</span>
            </Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Constancia de Trabajo, RIF 2026..."
              className="bg-surface-container-lowest"
            />
            {errors.nombre && <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>}
          </div>

          {/* Categoría y Versión alineadas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="categoria" className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Categoría <span className="text-error">*</span>
              </Label>
              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-surface-container-lowest border-outline-variant/80">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_LIST.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="version" className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Versión <span className="text-error">*</span>
              </Label>
              <Input
                id="version"
                {...register('version')}
                placeholder="1.0"
                className="font-mono text-sm bg-surface-container-lowest"
              />
              {errors.version && <p className="mt-1 text-xs text-error">{errors.version.message}</p>}
            </div>
          </div>

          {/* Option Card de Plantilla Word Generable a ancho completo */}
          <div>
            <label
              className={`flex items-center justify-between gap-3 cursor-pointer rounded-xl border p-3 transition-all ${
                esPlantillaGenerable
                  ? 'border-primary/60 bg-primary/5 shadow-xs'
                  : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('es_plantilla_generable')}
                  className="rounded border-outline-variant text-primary focus:ring-primary/40 h-4 w-4 shrink-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Icon name="description" size={16} className="text-primary" />
                    Es plantilla Word generable (.docx)
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Permite definir variables Jinja2 para la generación automatizada de documentos
                  </p>
                </div>
              </div>
              <span className={`hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                esPlantillaGenerable
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-surface-container-high text-on-surface-variant border-transparent'
              }`}>
                {esPlantillaGenerable ? 'Jinja2 Activo' : 'Documento Estático'}
              </span>
            </label>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion" className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
              Descripción u Observaciones
            </Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Detalles acerca de este documento o su uso dentro de la compañía..."
              className="text-sm min-h-[70px] bg-surface-container-lowest"
            />
          </div>

          {/* Editor de Variables Jinja2 */}
          {esPlantillaGenerable && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3 transition-all animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Icon name="auto_fix_high" size={16} /> Variables Jinja2 de la Plantilla
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Define los campos Jinja2 que el usuario rellenará (ej: <code className="rounded bg-primary/10 px-1 py-0.5 font-mono text-primary text-[10px]">{'{{ nombre }}'}</code>)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarVariable}
                  className="gap-1.5 text-xs bg-surface-container-lowest shadow-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Icon name="add" size={16} /> Variable
                </Button>
              </div>

              {variables.length === 0 ? (
                <div className="rounded-lg border border-dashed border-primary/20 bg-surface-container-lowest/60 p-3 text-center">
                  <p className="text-xs text-on-surface-variant/80 italic">
                    Sin variables configuradas. El usuario podrá enviar un diccionario de datos libre.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {variables.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2.5 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <Input
                          placeholder="clave (ej: nombre)"
                          value={v.clave}
                          onChange={(e) => actualizarVariable(idx, 'clave', e.target.value)}
                          className="h-8 text-xs font-mono bg-surface border-outline-variant/60"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          placeholder="Etiqueta visible"
                          value={v.etiqueta}
                          onChange={(e) => actualizarVariable(idx, 'etiqueta', e.target.value)}
                          className="h-8 text-xs bg-surface border-outline-variant/60"
                        />
                      </div>
                      <div className="w-28 shrink-0">
                        <Select
                          value={v.tipo || 'texto'}
                          onValueChange={(val) => actualizarVariable(idx, 'tipo', val)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-surface border-outline-variant/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="fecha">Fecha</SelectItem>
                            <SelectItem value="numero">Número</SelectItem>
                            <SelectItem value="textarea">Texto largo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-error hover:bg-error-container/20 hover:text-error shrink-0 self-end sm:self-center"
                        onClick={() => eliminarVariable(idx)}
                        title="Eliminar variable"
                      >
                        <Icon name="delete" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-outline-variant/30 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2 min-w-[140px]">
              {isLoading ? (
                <>
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Icon name={isEditing ? 'save' : 'cloud_upload'} size={18} />
                  {isEditing ? 'Guardar Cambios' : 'Subir Documento'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


