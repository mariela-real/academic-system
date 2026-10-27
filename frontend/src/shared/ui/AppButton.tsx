import { Button } from '@mui/material'
import type { ButtonProps } from '@mui/material'

export type AppButtonProps = ButtonProps

export function AppButton(props: AppButtonProps) {
  return <Button {...props} />
}
