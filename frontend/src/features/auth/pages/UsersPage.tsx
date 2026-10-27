import { useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { createUser } from '../api/auth'
import type { UserRole } from '../types/auth-user'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setFullName('')
      setEmail('')
      setPassword('')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Crea cuentas institucionales y asigna el rol correspondiente."
        title="Cuentas de usuario"
      />

      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              createMutation.mutate({ fullName, email, password, role })
            }}
          >
            <Typography component="h2" variant="h6">
              Crear cuenta
            </Typography>

            {createMutation.isError ? (
              <Alert severity="error">
                {getUserFacingErrorMessage(
                  createMutation.error,
                  'No se pudo crear la cuenta. Verifica los datos e inténtalo nuevamente.',
                )}
              </Alert>
            ) : null}

            {createMutation.isSuccess ? (
              <Alert severity="success">
                Cuenta creada correctamente.
                {createMutation.data.role === 'student'
                  ? ' Ahora puedes vincularla desde Estudiantes.'
                  : ''}
              </Alert>
            ) : null}

            <AppTextField
              label="Nombre completo"
              onChange={(event) => setFullName(event.target.value)}
              required
              value={fullName}
            />

            <AppTextField
              autoComplete="email"
              label="Correo electrónico"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />

            <AppTextField
              autoComplete="new-password"
              helperText="La contraseña debe tener al menos 12 caracteres."
              label="Contraseña temporal"
              onChange={(event) => setPassword(event.target.value)}
              required
              slotProps={{ htmlInput: { minLength: 12, maxLength: 72 } }}
              type="password"
              value={password}
            />

            <AppTextField
              select
              label="Rol"
              onChange={(event) => {
                if (isUserRole(event.target.value)) {
                  setRole(event.target.value)
                }
              }}
              value={role}
            >
              <MenuItem value="student">Estudiante</MenuItem>
              <MenuItem value="teacher">Docente</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </AppTextField>

            <AppButton
              disabled={createMutation.isPending}
              type="submit"
              variant="contained"
            >
              Crear usuario
            </AppButton>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

function isUserRole(value: string): value is UserRole {
  return value === 'admin' || value === 'teacher' || value === 'student'
}
