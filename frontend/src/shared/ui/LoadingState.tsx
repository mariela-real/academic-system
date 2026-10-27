import { CircularProgress, Stack, Typography } from '@mui/material'

type LoadingStateProps = {
  message?: string
}

export function LoadingState({
  message = 'Cargando...',
}: LoadingStateProps) {
  return (
    <Stack
      direction="row"
      role="status"
      spacing={1.5}
      sx={{ alignItems: 'center', py: 3 }}
    >
      <CircularProgress aria-label={message} size={24} />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  )
}
