import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'

type StatusChipProps = {
  label: string
  tone?: 'default' | 'error' | 'info' | 'success' | 'warning'
  sx?: ChipProps['sx']
}

export function StatusChip({
  label,
  tone = 'default',
  sx,
}: StatusChipProps) {
  return <Chip color={tone} label={label} size="small" sx={sx} />
}
