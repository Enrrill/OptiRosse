/** Formatea bytes a unidad legible (B, KB, MB, GB). */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export interface FileConfig {
  label: string
  icon: string
  badgeBg: string
  iconBg: string
}

export function getFileConfig(extension: string): FileConfig {
  const ext = (extension || '').toLowerCase()
  if (['docx', 'doc'].includes(ext)) {
    return {
      label: 'Word',
      icon: 'description',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    }
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return {
      label: 'Excel',
      icon: 'table_chart',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    }
  }
  if (ext === 'pdf') {
    return {
      label: 'PDF',
      icon: 'picture_as_pdf',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    }
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return {
      label: 'Imagen',
      icon: 'image',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    }
  }
  return {
    label: ext ? ext.toUpperCase() : 'Archivo',
    icon: 'insert_drive_file',
    badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    iconBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  }
}

export interface CategoriaBadge {
  label: string
  class: string
}

export function getCategoriaBadge(categoria: string): CategoriaBadge {
  switch (categoria) {
    case 'institucional':
      return { label: 'Institucional', class: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' }
    case 'recursos_humanos':
      return { label: 'Recursos Humanos', class: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' }
    case 'financiero':
      return { label: 'Financiero', class: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' }
    case 'operativo':
      return { label: 'Operativo', class: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' }
    default:
      return { label: 'Otro', class: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' }
  }
}
