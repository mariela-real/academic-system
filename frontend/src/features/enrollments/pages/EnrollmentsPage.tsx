import { useState } from 'react'
import {
  Alert,
  Card,
  CardActions,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import type { AuthUser } from '../../auth/types/auth-user'
import { formatBoliviaDate } from '../../../shared/lib/bolivia-date'
import { QueryState } from '../../../shared/components/QueryState'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { getCourses } from '../../courses/api/courses'
import { getStudents } from '../../students/api/students'
import {
  cancelEnrollment,
  createEnrollment,
  getEnrollments,
} from '../api/enrollments'

type EnrollmentsPageProps = {
  user: AuthUser
}

export function EnrollmentsPage({ user }: EnrollmentsPageProps) {
  const queryClient = useQueryClient()
  const isAdministrator = user.role === 'admin'
  const [courseId, setCourseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [reason, setReason] = useState('')
  const enrollmentsQuery = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
  })
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    enabled: isAdministrator,
  })
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
    enabled: isAdministrator,
  })
  const createMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: async () => {
      setCourseId('')
      setStudentId('')
      setReason('')
      await refreshData()
    },
  })
  const cancelMutation = useMutation({
    mutationFn: ({ id, justification }: { id: string; justification?: string }) =>
      cancelEnrollment(id, justification),
    onSuccess: async () => {
      setReason('')
      await refreshData()
    },
  })

  async function refreshData() {
    await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    await queryClient.invalidateQueries({ queryKey: ['grades'] })
    await queryClient.invalidateQueries({ queryKey: ['academic-history'] })
    await queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="El backend verifica permisos, vigencia de la gestión y cupos disponibles."
        title="Inscripciones"
      />

      {isAdministrator ? (
        <Card variant="outlined">
          <CardContent>
            <Stack
              component="form"
              spacing={2}
              onSubmit={(event) => {
                event.preventDefault()
                createMutation.mutate({
                  courseId,
                  studentId,
                  ...(reason.trim().length > 0
                    ? { reason: reason.trim() }
                    : {}),
                })
              }}
            >
              <Typography component="h2" variant="h6">
                Gestionar inscripción
              </Typography>

              <AppTextField
                select
                disabled={
                  coursesQuery.isPending ||
                  (coursesQuery.data?.length ?? 0) === 0
                }
                label="Curso"
                onChange={(event) => setCourseId(event.target.value)}
                required
                value={courseId}
              >
                <MenuItem disabled value="">
                  Selecciona un curso
                </MenuItem>
                {(coursesQuery.data ?? []).map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.subjectCode} · {course.subjectName} ·{' '}
                    {course.academicPeriod}
                  </MenuItem>
                ))}
              </AppTextField>

              <AppTextField
                select
                disabled={
                  studentsQuery.isPending ||
                  (studentsQuery.data?.length ?? 0) === 0
                }
                label="Estudiante"
                onChange={(event) => setStudentId(event.target.value)}
                required
                value={studentId}
              >
                <MenuItem disabled value="">
                  Selecciona un estudiante
                </MenuItem>
                {(studentsQuery.data ?? []).map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.studentNumber} · {student.fullName}
                  </MenuItem>
                ))}
              </AppTextField>

              {coursesQuery.data?.length === 0 ? (
                <Alert severity="info">
                  Registra cursos antes de gestionar inscripciones.
                </Alert>
              ) : null}

              {studentsQuery.data?.length === 0 ? (
                <Alert severity="info">
                  Registra perfiles de estudiante antes de gestionar inscripciones.
                </Alert>
              ) : null}

              <AppTextField
                helperText="Obligatorio si la gestión está fuera de fechas."
                label="Motivo de excepción (si corresponde)"
                onChange={(event) => setReason(event.target.value)}
                value={reason}
              />

              {createMutation.isError ? (
                <Alert severity="error">
                  {getUserFacingErrorMessage(
                    createMutation.error,
                    'No se pudo registrar la inscripción. Verifica los datos e inténtalo nuevamente.',
                  )}
                </Alert>
              ) : null}

              <AppButton
                disabled={
                  createMutation.isPending ||
                  coursesQuery.isPending ||
                  studentsQuery.isPending ||
                  (coursesQuery.data?.length ?? 0) === 0 ||
                  (studentsQuery.data?.length ?? 0) === 0
                }
                type="submit"
                variant="contained"
              >
                Inscribir estudiante
              </AppButton>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {cancelMutation.isError ? (
        <Alert severity="error">
          {getUserFacingErrorMessage(
            cancelMutation.error,
            'No se pudo cancelar la inscripción. Inténtalo nuevamente.',
          )}
        </Alert>
      ) : null}

      {createMutation.isSuccess ? (
        <Alert severity="success">
          La inscripción quedó registrada o reactivada.
        </Alert>
      ) : null}

      {cancelMutation.isSuccess ? (
        <Alert severity="success">La inscripción se canceló correctamente.</Alert>
      ) : null}

      {isAdministrator ? (
        <QueryState
          error={coursesQuery.error ?? studentsQuery.error}
          isError={coursesQuery.isError || studentsQuery.isError}
          isPending={coursesQuery.isPending || studentsQuery.isPending}
          onRetry={() => {
            void coursesQuery.refetch()
            void studentsQuery.refetch()
          }}
        />
      ) : null}

      <QueryState
        error={enrollmentsQuery.error}
        isError={enrollmentsQuery.isError}
        isPending={enrollmentsQuery.isPending}
        onRetry={() => void enrollmentsQuery.refetch()}
      />

      {enrollmentsQuery.data?.length === 0 ? (
        <EmptyState
          description="Las inscripciones registradas aparecerán en esta lista."
          title="No hay inscripciones para mostrar"
        />
      ) : null}

      {enrollmentsQuery.data?.map((enrollment) => {
        const canCancel =
          enrollment.status === 'active' &&
          (user.role === 'student' || isAdministrator)

        return (
          <Card key={enrollment.id} variant="outlined">
            <CardContent>
              <Stack spacing={0.5}>
                <Typography component="h2" variant="h6">
                  {enrollment.course.subjectCode} ·{' '}
                  {enrollment.course.subjectName}
                </Typography>
                <Typography color="text.secondary">
                  Estudiante: {enrollment.student.fullName} ·{' '}
                  {enrollment.student.studentNumber}
                </Typography>
                <Typography color="text.secondary">
                  Gestión {enrollment.course.academicPeriod} ·{' '}
                  {formatBoliviaDate(enrollment.createdAt)}
                </Typography>
                <Typography>
                  Estado: {enrollment.status === 'active' ? 'Activa' : 'Cancelada'}
                </Typography>
              </Stack>
            </CardContent>

            {canCancel ? (
              <CardActions sx={{ px: 2, pb: 2 }}>
                {isAdministrator ? (
                  <AppTextField
                    label="Motivo de excepción (si corresponde)"
                    onChange={(event) => setReason(event.target.value)}
                    size="small"
                    value={reason}
                  />
                ) : null}

                <AppButton
                  color="error"
                  disabled={cancelMutation.isPending}
                  onClick={() =>
                    cancelMutation.mutate({
                      id: enrollment.id,
                      ...(isAdministrator && reason.trim().length > 0
                        ? { justification: reason.trim() }
                        : {}),
                    })
                  }
                  variant="outlined"
                >
                  Cancelar inscripción
                </AppButton>
              </CardActions>
            ) : null}
          </Card>
        )
      })}
    </Stack>
  )
}
