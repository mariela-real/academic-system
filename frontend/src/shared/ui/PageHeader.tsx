import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography component="h1" variant="h4">
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>
  )
}
