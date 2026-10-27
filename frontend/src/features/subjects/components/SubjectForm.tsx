import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { FormEvent, Ref } from 'react'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import type {
  SubjectFormErrors,
  SubjectFormValues,
} from '../lib/subject-form'

type SubjectFormProps = {
  values: SubjectFormValues
  errors: SubjectFormErrors
  isEditing: boolean
  isPending: boolean
  codeInputRef: Ref<HTMLInputElement>
  onFieldChange: (field: keyof SubjectFormValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function SubjectForm({
  values,
  errors,
  isEditing,
  isPending,
  codeInputRef,
  onFieldChange,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  return (
    <Card id="subject-form" variant="outlined">
      <CardContent>
        <Stack component="form" onSubmit={onSubmit} spacing={2}>
          <Typography component="h2" variant="h6">
            {isEditing ? 'Editar materia' : 'Registrar materia'}
          </Typography>

          <AppTextField
            autoComplete="off"
            error={errors.code !== undefined}
            helperText={errors.code}
            inputRef={codeInputRef}
            label="Código"
            onChange={(event) => onFieldChange('code', event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 50 } }}
            value={values.code}
          />

          <AppTextField
            error={errors.name !== undefined}
            helperText={errors.name}
            label="Nombre"
            onChange={(event) => onFieldChange('name', event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 150 } }}
            value={values.name}
          />

          <AppTextField
            error={errors.description !== undefined}
            helperText={errors.description ?? 'Máximo 2000 caracteres.'}
            label="Descripción"
            minRows={3}
            multiline
            onChange={(event) =>
              onFieldChange('description', event.target.value)
            }
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            value={values.description}
          />

          <Stack direction="row" spacing={1}>
            <AppButton
              disabled={isPending}
              type="submit"
              variant="contained"
            >
              {isEditing ? 'Guardar cambios' : 'Guardar materia'}
            </AppButton>
            {isEditing ? (
              <AppButton disabled={isPending} onClick={onCancel}>
                Cancelar edición
              </AppButton>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
