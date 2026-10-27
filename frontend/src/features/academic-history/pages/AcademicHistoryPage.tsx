import { useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { AuthUser } from '../../auth/types/auth-user'
import { formatBoliviaDate } from '../../../shared/lib/bolivia-date'
import { QueryState } from '../../../shared/components/QueryState'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { getStudents } from '../../students/api/students'
import {
  getOwnAcademicHistory,
  getStudentAcademicHistory,
} from '../api/academic-history'

type AcademicHistoryPageProps = {
  user: AuthUser
}

export function AcademicHistoryPage({ user }: AcademicHistoryPageProps) {
  const [studentId, setStudentId] = useState('')
  const isStudent = user.role === 'student'
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
    enabled: isStudent === false,
  })
  const historyQuery = useQuery({
    queryKey: ['academic-history', isStudent ? user.id : studentId],
    queryFn: () =>
      isStudent
        ? getOwnAcademicHistory()
        : getStudentAcademicHistory(studentId),
    enabled: isStudent || studentId.length > 0,
  })

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Incluye todas las inscripciones y la calificación vigente, si existe."
        title="Historial académico"
      />

      {!isStudent ? (
        <AppTextField
          select
          label="Estudiante"
          disabled={studentsQuery.isPending || studentsQuery.isError}
          onChange={(event) => setStudentId(event.target.value)}
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
      ) : null}

      {!isStudent ? (
        <QueryState
          error={studentsQuery.error}
          isError={studentsQuery.isError}
          isPending={studentsQuery.isPending}
          onRetry={() => void studentsQuery.refetch()}
        />
      ) : null}

      <QueryState
        error={historyQuery.error}
        isError={historyQuery.isError}
        isPending={historyQuery.isLoading}
        onRetry={() => void historyQuery.refetch()}
      />

      {!isStudent && studentId.length === 0 ? (
        <Alert severity="info">
          Selecciona un estudiante para consultar su historial.
        </Alert>
      ) : null}

      {historyQuery.data ? (
        <Alert severity="info">
          {historyQuery.data.student.studentNumber} ·{' '}
          {historyQuery.data.student.fullName}
        </Alert>
      ) : null}

      {historyQuery.data?.records.length === 0 ? (
        <EmptyState
          description="Las inscripciones y calificaciones se mostrarán cuando existan registros."
          title="No hay registros académicos"
        />
      ) : null}

      {historyQuery.data?.records.map((record) => (
        <Card key={record.enrollmentId} variant="outlined">
          <CardContent>
            <Stack spacing={0.5}>
              <Typography component="h2" variant="h6">
                {record.course.subjectCode} · {record.course.subjectName}
              </Typography>
              <Typography color="text.secondary">
                Gestión {record.course.academicPeriod} · Inscripción{' '}
                {formatBoliviaDate(record.enrolledAt)}
              </Typography>
              <Typography>
                Estado: {record.status === 'active' ? 'Activa' : 'Cancelada'}
              </Typography>
              <Typography>
                Calificación:{' '}
                {record.grade === null ? 'Pendiente' : record.grade.value}
              </Typography>
              {record.grade ? (
                <Typography color="text.secondary">
                  Actualizada {formatBoliviaDate(record.grade.updatedAt)}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
