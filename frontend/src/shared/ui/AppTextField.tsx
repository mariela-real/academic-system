import { TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'

export type AppTextFieldProps = TextFieldProps

export function AppTextField(props: AppTextFieldProps) {
  return <TextField {...props} />
}
