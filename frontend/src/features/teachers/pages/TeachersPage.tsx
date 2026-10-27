import { useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryState } from '../../../shared/components/QueryState'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { createTeacher, getTeachers } from '../api/teachers'

export function TeachersPage() {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const teachersQuery = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
  })
  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: async () => {
      setFullName('')
      setEmail('')
      setPassword('')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Registra cuentas docentes y asígnalas a cursos desde la oferta académica."
        title="Docentes"
      />

      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              createMutation.mutate({ fullName, email, password })
            }}
          >
            <Typography component="h2" variant="h6">
              Registrar docente
            </Typography>

            {createMutation.isError ? (
              <Alert severity="error">
                {getUserFacingErrorMessage(
                  createMutation.error,
                  'No se pudo registrar el docente. Verifica los datos e inténtalo nuevamente.',
                )}
              </Alert>
            ) : null}

            {createMutation.isSuccess ? (
              <Alert severity="success">
                La cuenta docente se creó correctamente.
              </Alert>
            ) : null}

            <AppTextField
              autoComplete="name"
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

            <AppButton
              disabled={createMutation.isPending}
              type="submit"
              variant="contained"
            >
              {createMutation.isPending ? 'Registrando…' : 'Registrar docente'}
            </AppButton>
          </Stack>
        </CardContent>
      </Card>

      <QueryState
        error={teachersQuery.error}
        isError={teachersQuery.isError}
        isPending={teachersQuery.isPending}
        onRetry={() => void teachersQuery.refetch()}
      />

      {teachersQuery.data?.length === 0 ? (
        <EmptyState
          description="Las cuentas docentes aparecerán aquí al registrarlas."
          title="No hay docentes registrados"
        />
      ) : null}

      {teachersQuery.data?.map((teacher) => (
        <Card key={teacher.id} variant="outlined">
          <CardContent>
            <Typography component="h2" variant="h6">
              {teacher.fullName}
            </Typography>
            <Typography color="text.secondary">{teacher.email}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
