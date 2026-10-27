import { Alert, Stack } from '@mui/material'
import { getUserFacingErrorMessage } from '../api/client'
import { AppButton } from './AppButton'

type ErrorStateProps = {
  error?: Error | string | null
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = getUserFacingErrorMessage(
    typeof error === 'string' ? new Error(error) : error,
    'No se pudieron cargar los datos.',
  )

  return (
    <Stack spacing={1}>
      <Alert severity="error">{message}</Alert>
      {onRetry ? (
        <AppButton
          onClick={onRetry}
          sx={{ alignSelf: 'start' }}
          variant="outlined"
        >
          Reintentar
        </AppButton>
      ) : null}
    </Stack>
  )
}
