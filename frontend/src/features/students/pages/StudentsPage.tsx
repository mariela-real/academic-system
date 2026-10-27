import { useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import { QueryState } from '../../../shared/components/QueryState'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { getUsers } from '../../auth/api/auth'
import { createStudent, getStudents } from '../api/students'

export function StudentsPage() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  })
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      setUserId('')
      setStudentNumber('')
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
  const linkedUserIds = new Set(
    (studentsQuery.data ?? []).map((student) => student.userId),
  )
  const studentAccounts = (usersQuery.data ?? []).filter(
    (account) => account.role === 'student',
  )
  const availableAccounts = studentAccounts.filter(
    (account) => linkedUserIds.has(account.id) === false,
  )

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Administra los perfiles académicos vinculados a cuentas institucionales."
        title="Estudiantes"
      />

      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              createMutation.mutate({ userId, studentNumber })
            }}
          >
            <Typography component="h2" variant="h6">
              Vincular cuenta de estudiante
            </Typography>

            <AppTextField
              select
              disabled={
                availableAccounts.length === 0 ||
                studentsQuery.isPending ||
                studentsQuery.isError
              }
              label="Cuenta institucional"
              onChange={(event) => setUserId(event.target.value)}
              required
              value={userId}
            >
              <MenuItem disabled value="">
                Selecciona una cuenta
              </MenuItem>
              {availableAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.fullName} · {account.email}
                </MenuItem>
              ))}
            </AppTextField>

            {usersQuery.data && availableAccounts.length === 0 ? (
              <Alert severity="info">
                {studentAccounts.length === 0
                  ? 'Crea primero una cuenta con rol Estudiante en Usuarios.'
                  : 'Todas las cuentas de estudiante ya tienen un perfil vinculado.'}
              </Alert>
            ) : null}

            <AppTextField
              label="Número institucional"
              onChange={(event) => setStudentNumber(event.target.value)}
              required
              value={studentNumber}
            />

            {createMutation.isSuccess ? (
              <Alert severity="success">
                El perfil de estudiante se registró correctamente.
              </Alert>
            ) : null}

            {createMutation.isError ? (
              <Alert severity="error">
                {getUserFacingErrorMessage(
                  createMutation.error,
                  'No se pudo registrar el perfil. Verifica los datos e inténtalo nuevamente.',
                )}
              </Alert>
            ) : null}

            <AppButton
              disabled={
                createMutation.isPending ||
                usersQuery.isPending ||
                usersQuery.isError ||
                studentsQuery.isPending ||
                studentsQuery.isError ||
                availableAccounts.length === 0
              }
              type="submit"
              variant="contained"
            >
              Registrar perfil
            </AppButton>
          </Stack>
        </CardContent>
      </Card>

      <QueryState
        error={studentsQuery.error}
        isError={studentsQuery.isError}
        isPending={studentsQuery.isPending}
        onRetry={() => void studentsQuery.refetch()}
      />

      <QueryState
        error={usersQuery.error}
        isError={usersQuery.isError}
        isPending={usersQuery.isPending}
        onRetry={() => void usersQuery.refetch()}
      />

      {studentsQuery.data?.length === 0 ? (
        <EmptyState
          description="Vincula una cuenta institucional para crear el primer perfil."
          title="No hay estudiantes registrados"
        />
      ) : null}

      {studentsQuery.data?.map((student) => (
        <Card key={student.id} variant="outlined">
          <CardContent>
            <Typography component="h2" variant="h6">
              {student.studentNumber} · {student.fullName}
            </Typography>
            <Typography color="text.secondary">
              {student.email}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
