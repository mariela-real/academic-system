import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import type { AuthUser } from '../../auth/types/auth-user'
import { formatBoliviaDate } from '../../../shared/lib/bolivia-date'
import { QueryState } from '../../../shared/components/QueryState'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { getEnrollments } from '../../enrollments/api/enrollments'
import type { Enrollment } from '../../enrollments/api/enrollments'
import { getGrades, setGrade } from '../api/grades'

type GradesPageProps = {
  user: AuthUser
}

export function GradesPage({ user }: GradesPageProps) {
  const queryClient = useQueryClient()
  const enrollmentsQuery = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
  })
  const gradesQuery = useQuery({
    queryKey: ['grades'],
    queryFn: getGrades,
  })
  const gradesByEnrollmentId = new Map(
    (gradesQuery.data ?? []).map((grade) => [grade.enrollment.id, grade]),
  )
  const activeEnrollments = (enrollmentsQuery.data ?? []).filter(
    (enrollment) => enrollment.status === 'active',
  )
  const isTeacher = user.role === 'teacher'

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Escala de 0 a 100. Solo el docente asignado puede cargar o corregir notas."
        title="Calificaciones"
      />

      <QueryState
        error={enrollmentsQuery.error ?? gradesQuery.error}
        isError={enrollmentsQuery.isError || gradesQuery.isError}
        isPending={enrollmentsQuery.isPending || gradesQuery.isPending}
        onRetry={() => {
          void enrollmentsQuery.refetch()
          void gradesQuery.refetch()
        }}
      />

      {isTeacher
        ? activeEnrollments.map((enrollment) => (
            <TeacherGradeCard
              key={enrollment.id}
              enrollment={enrollment}
              existingValue={gradesByEnrollmentId.get(enrollment.id)?.value}
              onSaved={async () => {
                await queryClient.invalidateQueries({ queryKey: ['grades'] })
                await queryClient.invalidateQueries({
                  queryKey: ['academic-history'],
                })
                await queryClient.invalidateQueries({
                  queryKey: ['audit-logs'],
                })
              }}
            />
          ))
        : (gradesQuery.data ?? []).map((grade) => (
            <Card key={grade.id} variant="outlined">
              <CardContent>
                <Typography component="h2" variant="h6">
                  {grade.enrollment.course.subjectCode} ·{' '}
                  {grade.enrollment.course.subjectName}
                </Typography>
                <Typography>
                  {grade.enrollment.student.fullName} ·{' '}
                  {grade.enrollment.student.studentNumber}
                </Typography>
                <Typography>
                  Gestión {grade.enrollment.course.academicPeriod} · Nota{' '}
                  <strong>{grade.value}</strong>
                </Typography>
                <Typography color="text.secondary">
                  Actualizada {formatBoliviaDate(grade.updatedAt)}
                </Typography>
              </CardContent>
            </Card>
          ))}

      {!isTeacher && gradesQuery.data?.length === 0 ? (
        <EmptyState
          description="Las notas vigentes de tus cursos aparecerán aquí."
          title="No hay calificaciones registradas"
        />
      ) : null}

      {isTeacher && activeEnrollments.length === 0 ? (
        <EmptyState
          description="Las inscripciones activas de tus cursos aparecerán aquí."
          title="No hay estudiantes pendientes de calificación"
        />
      ) : null}
    </Stack>
  )
}

type TeacherGradeCardProps = {
  enrollment: Enrollment
  existingValue?: number
  onSaved: () => Promise<void>
}

function TeacherGradeCard({
  enrollment,
  existingValue,
  onSaved,
}: TeacherGradeCardProps) {
  const [value, setValue] = useState(
    existingValue === undefined ? '' : String(existingValue),
  )
  const gradeMutation = useMutation({
    mutationFn: () => setGrade(enrollment.id, Number(value)),
    onSuccess: onSaved,
  })

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          component="form"
          spacing={1.5}
          onSubmit={(event) => {
            event.preventDefault()
            gradeMutation.mutate()
          }}
        >
          <Typography component="h2" variant="h6">
            {enrollment.course.subjectCode} · {enrollment.course.subjectName}
          </Typography>
          <Typography color="text.secondary">
            {enrollment.student.fullName} · {enrollment.student.studentNumber}
          </Typography>

          {gradeMutation.isError ? (
            <Alert severity="error">
              {getUserFacingErrorMessage(
                gradeMutation.error,
                'No se pudo guardar la calificación. Verifica el valor e inténtalo nuevamente.',
              )}
            </Alert>
          ) : null}

          <TextField
            label="Calificación (0–100)"
            onChange={(event) => setValue(event.target.value)}
            required
            slotProps={{ htmlInput: { max: 100, min: 0, step: 0.01 } }}
            type="number"
            value={value}
          />

          <Button
            disabled={gradeMutation.isPending}
            type="submit"
            variant="contained"
          >
            {existingValue === undefined ? 'Registrar nota' : 'Guardar corrección'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
