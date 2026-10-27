import { InboxOutlined } from '@mui/icons-material'
import { Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Stack
      role="status"
      spacing={1}
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        color: 'text.secondary',
        px: 3,
        py: 5,
        textAlign: 'center',
      }}
    >
      <InboxOutlined aria-hidden="true" fontSize="large" />
      <Typography color="text.primary" component="h2" variant="h6">
        {title}
      </Typography>
      {description ? <Typography>{description}</Typography> : null}
      {action}
    </Stack>
  )
}
