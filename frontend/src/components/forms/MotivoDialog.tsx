import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/Icon'
import { FieldError } from './FieldError'

interface MotivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  loading?: boolean
  onSubmit: (motivo: string) => void
}

export function MotivoDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  loading = false,
  onSubmit,
}: MotivoDialogProps) {
  const [motivo, setMotivo] = useState('')
  const [touched, setTouched] = useState(false)

  const error = touched && motivo.trim().length === 0

  const handleClose = (next: boolean) => {
    if (!next) {
      setMotivo('')
      setTouched(false)
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
    if (motivo.trim().length === 0) {
      setTouched(true)
      return
    }
    onSubmit(motivo.trim())
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo</Label>
          <Textarea
            id="motivo"
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value)
              setTouched(true)
            }}
            placeholder="Explica el motivo de esta acción..."
            rows={3}
            aria-invalid={error}
          />
          {error && <FieldError message="El motivo es obligatorio" />}
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" disabled={loading} onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={loading} onClick={handleSubmit}>
            {loading && <Icon name="progress_activity" className="mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}