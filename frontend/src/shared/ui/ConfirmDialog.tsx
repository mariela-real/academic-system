import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { AppButton } from './AppButton'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClose={isPending ? undefined : onCancel}
      open={open}
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <AppButton disabled={isPending} onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton
          color="error"
          disabled={isPending}
          onClick={onConfirm}
          variant="contained"
        >
          {confirmLabel}
        </AppButton>
      </DialogActions>
    </Dialog>
  )
}
