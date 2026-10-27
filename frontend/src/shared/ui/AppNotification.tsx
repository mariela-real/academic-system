import { Alert, Snackbar } from '@mui/material'
import type { AlertColor } from '@mui/material/Alert'

type AppNotificationProps = {
  open: boolean
  severity: AlertColor
  message: string
  onClose: () => void
}

export function AppNotification({
  open,
  severity,
  message,
  onClose,
}: AppNotificationProps) {
  return (
    <Snackbar
      autoHideDuration={5000}
      onClose={onClose}
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  )
}
