import { useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import type { AuthUser } from '../../auth/types/auth-user'
import { getUsers } from '../../auth/api/auth'
import {
  createCourse,
  getCourses,
  updateCourse,
} from '../api/courses'
import { createEnrollment } from '../../enrollments/api/enrollments'
import { getAcademicPeriods } from '../../academic-periods/api/academic-periods'
import type { AcademicPeriod } from '../../academic-periods/api/academic-periods'
import { getSubjects } from '../../subjects/api/subjects'
import { QueryState } from '../../../shared/components/QueryState'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import type { Course } from '../api/courses'
import { parseCourseCapacity } from '../lib/course-form'

type CoursesPageProps = {
  user: AuthUser
}

function isStudentEnrollmentOpen(
  code: string,
  periods: AcademicPeriod[],
): boolean {
  const period = periods.find((item) => item.code === code)

  if (period === undefined || period.enabled === false) {
    return false
  }

  const now = Date.now()

  return (
    now >= new Date(period.enrollmentStartsAt).getTime() &&
    now < new Date(period.enrollmentEndsAt).getTime()
  )
}

export function CoursesPage({ user }: CoursesPageProps) {
  const queryClient = useQueryClient()
  const isAdministrator = user.role === 'admin'
  const [capacityError, setCapacityError] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [capacity, setCapacity] = useState('')
  const [editingInstructorId, setEditingInstructorId] = useState('')
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })
  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
    enabled: isAdministrator,
  })
  const periodsQuery = useQuery({
    queryKey: ['academic-periods'],
    queryFn: getAcademicPeriods,
  })
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isAdministrator,
  })
  const teachers = (usersQuery.data ?? []).filter(
    (account) => account.role === 'teacher',
  )
  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
  const enrollmentMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
  const capacityMutation = useMutation({
    mutationFn: ({
      id,
      capacity,
      instructorId,
    }: {
      id: string
      capacity: number
      instructorId: string | null
    }) => updateCourse(id, { capacity, instructorId }),
    onSuccess: async () => {
      setEditingCourse(null)
      setCapacityError('')
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
  const formError = [
    subjectsQuery.error,
    periodsQuery.error,
    usersQuery.error,
  ].find((error) => error !== null && error !== undefined)
  const catalogError =
    formError === undefined
      ? ''
      : getUserFacingErrorMessage(
          formError,
          'No se pudieron cargar las materias, gestiones o docentes.',
        )

  function saveCourseCapacity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingCourse === null) {
      return
    }

    const updatedCapacity = parseCourseCapacity(capacity)

    if (updatedCapacity === null) {
      setCapacityError('El cupo debe ser un entero mayor que cero.')
      return
    }

    setCapacityError('')
    capacityMutation.mutate({
      id: editingCourse.id,
      capacity: updatedCapacity,
      instructorId:
        editingInstructorId.length > 0 ? editingInstructorId : null,
    })
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Consulta cursos, gestión académica y capacidad registrada."
        title="Oferta académica"
      />

      {isAdministrator ? (
        <CourseCreateForm
          periods={(periodsQuery.data ?? []).filter((period) => period.enabled)}
          subjects={subjectsQuery.data ?? []}
          isPending={
            subjectsQuery.isPending ||
            periodsQuery.isPending ||
            usersQuery.isPending
          }
          isSaving={createCourseMutation.isPending}
          catalogError={catalogError}
          teachers={teachers}
          onSubmit={async (input) => {
            await createCourseMutation.mutateAsync(input)
          }}
        />
      ) : null}

      {isAdministrator ? (
        <QueryState
          error={usersQuery.error}
          isError={usersQuery.isError}
          isPending={false}
          onRetry={() => void usersQuery.refetch()}
        />
      ) : null}

      {enrollmentMutation.isError ? (
        <Alert severity="error">
          {getUserFacingErrorMessage(
            enrollmentMutation.error,
            'No se pudo registrar la inscripción. Verifica las fechas y el cupo.',
          )}
        </Alert>
      ) : null}

      {enrollmentMutation.isSuccess ? (
        <Alert severity="success">
          Inscripción registrada. Si ya existía una cancelada, fue reactivada.
        </Alert>
      ) : null}

      {createCourseMutation.isSuccess ? (
        <Alert severity="success">El curso se creó correctamente.</Alert>
      ) : null}

      {capacityMutation.isError ? (
        <Alert severity="error">
          {getUserFacingErrorMessage(
            capacityMutation.error,
            'No se pudo actualizar el curso. Verifica sus datos e inténtalo nuevamente.',
          )}
        </Alert>
      ) : null}

      {capacityMutation.isSuccess ? (
        <Alert severity="success">El curso se actualizó correctamente.</Alert>
      ) : null}

      {capacityError ? <Alert severity="error">{capacityError}</Alert> : null}

      <QueryState
        error={coursesQuery.error}
        isError={coursesQuery.isError}
        isPending={coursesQuery.isPending}
        onRetry={() => void coursesQuery.refetch()}
      />

      {user.role === 'student' ? (
        <QueryState
          error={periodsQuery.error}
          isError={periodsQuery.isError}
          isPending={periodsQuery.isPending}
          onRetry={() => void periodsQuery.refetch()}
        />
      ) : null}

      {coursesQuery.data?.length === 0 ? (
        <EmptyState
          description="La oferta aparecerá aquí cuando se registren cursos para una gestión."
          title="No hay cursos registrados"
        />
      ) : null}

      {coursesQuery.data?.map((course) => (
        <Card key={course.id} variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between' }}
            >
              <Box>
                <Typography component="h2" variant="h6">
                  {course.subjectCode} · {course.subjectName}
                </Typography>
                <Typography color="text.secondary">
                  Gestión {course.academicPeriod} · Cupo {course.capacity}
                </Typography>
                <Typography color="text.secondary">
                  Docente: {course.instructor?.fullName ?? 'Sin asignar'}
                </Typography>
              </Box>

              {isAdministrator ? (
                <AppButton
                  onClick={() => {
                    capacityMutation.reset()
                    setEditingCourse(course)
                    setCapacity(String(course.capacity))
                    setEditingInstructorId(course.instructor?.id ?? '')
                    setCapacityError('')
                  }}
                  variant="outlined"
                >
                  Modificar cupo
                </AppButton>
              ) : null}
            </Stack>
          </CardContent>

          {user.role === 'student' ? (
            <CardActions sx={{ px: 2, pb: 2 }}>
              <AppButton
                disabled={
                  enrollmentMutation.isPending ||
                  isStudentEnrollmentOpen(
                    course.academicPeriod,
                    periodsQuery.data ?? [],
                  ) === false
                }
                onClick={() =>
                  enrollmentMutation.mutate({ courseId: course.id })
                }
                variant="contained"
              >
                {isStudentEnrollmentOpen(
                  course.academicPeriod,
                  periodsQuery.data ?? [],
                )
                  ? 'Inscribirme'
                  : 'Periodo cerrado'}
              </AppButton>
            </CardActions>
          ) : null}
        </Card>
      ))}

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={
          capacityMutation.isPending
            ? undefined
            : () => setEditingCourse(null)
        }
        open={editingCourse !== null}
      >
        <Box component="form" onSubmit={saveCourseCapacity}>
          <DialogTitle>Modificar cupo del curso</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {editingCourse
                ? `${editingCourse.subjectCode} · ${editingCourse.subjectName}`
                : 'Define el nuevo cupo máximo.'}
            </DialogContentText>
            <AppTextField
              autoFocus
              error={capacityError.length > 0}
              fullWidth
              helperText={capacityError || 'Debe ser un entero mayor que cero.'}
              label="Cupo máximo"
              onChange={(event) => setCapacity(event.target.value)}
              required
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              type="number"
              value={capacity}
            />
            <AppTextField
              select
              disabled={usersQuery.isPending || usersQuery.isError}
              label="Docente asignado"
              onChange={(event) => setEditingInstructorId(event.target.value)}
              value={editingInstructorId}
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {editingCourse?.instructor &&
              teachers.some(
                (teacher) => teacher.id === editingCourse.instructor?.id,
              ) === false ? (
                <MenuItem value={editingCourse.instructor.id}>
                  {editingCourse.instructor.fullName}
                </MenuItem>
              ) : null}
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </MenuItem>
              ))}
            </AppTextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <AppButton
              disabled={capacityMutation.isPending}
              onClick={() => setEditingCourse(null)}
            >
              Cancelar
            </AppButton>
            <AppButton
              disabled={capacityMutation.isPending}
              type="submit"
              variant="contained"
            >
              Guardar cambios
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}

type CourseCreateFormProps = {
  subjects: Array<{ id: string; code: string; name: string }>
  periods: Array<{ code: string; enabled: boolean }>
  teachers: Array<{ id: string; fullName: string }>
  isPending: boolean
  isSaving: boolean
  catalogError: string
  onSubmit: (input: {
    subjectId: string
    academicPeriod: string
    capacity: number
    instructorId?: string
  }) => Promise<void>
}

function CourseCreateForm({
  subjects,
  periods,
  teachers,
  isPending,
  isSaving,
  catalogError,
  onSubmit,
}: CourseCreateFormProps) {
  const [subjectId, setSubjectId] = useState('')
  const [academicPeriod, setAcademicPeriod] = useState('')
  const [capacity, setCapacity] = useState('30')
  const [instructorId, setInstructorId] = useState('')
  const [createError, setCreateError] = useState('')
  const [capacityError, setCapacityError] = useState('')

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          component="form"
          spacing={2}
          onSubmit={async (event) => {
            event.preventDefault()
            setCreateError('')
            const parsedCapacity = parseCourseCapacity(capacity)

            if (parsedCapacity === null) {
              setCapacityError('El cupo debe ser un entero mayor que cero.')
              return
            }

            try {
              setCapacityError('')
              await onSubmit({
                subjectId,
                academicPeriod,
                capacity: parsedCapacity,
                ...(instructorId.length > 0 ? { instructorId } : {}),
              })
              setSubjectId('')
              setAcademicPeriod('')
              setCapacity('30')
              setInstructorId('')
            } catch (submitError) {
              setCreateError(
                getUserFacingErrorMessage(
                  submitError,
                  'No se pudo crear el curso. Verifica los datos e inténtalo nuevamente.',
                ),
              )
            }
          }}
        >
          <Typography component="h2" variant="h6">
            Crear curso
          </Typography>

          {createError ? (
            <Alert severity="error">{createError}</Alert>
          ) : null}

          {isPending ? (
            <Alert severity="info">
              Cargando materias y gestiones académicas.
            </Alert>
          ) : null}

          {catalogError ? (
            <Alert severity="error">{catalogError}</Alert>
          ) : null}

          {periods.length === 0 && isPending === false ? (
            <Alert severity="warning">
              No hay gestiones académicas habilitadas.
            </Alert>
          ) : null}

          {subjects.length === 0 && isPending === false ? (
            <Alert severity="warning">
              Registra una materia antes de crear un curso.
            </Alert>
          ) : null}

          <AppTextField
            select
            label="Materia"
            disabled={subjects.length === 0}
            onChange={(event) => setSubjectId(event.target.value)}
            required
            value={subjectId}
          >
            <MenuItem disabled value="">
              Selecciona una materia
            </MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.code} · {subject.name}
              </MenuItem>
            ))}
          </AppTextField>

          <AppTextField
            select
            label="Gestión académica"
            disabled={periods.length === 0}
            onChange={(event) => setAcademicPeriod(event.target.value)}
            required
            value={academicPeriod}
          >
            <MenuItem disabled value="">
              Selecciona una gestión
            </MenuItem>
            {periods
              .filter((period) => period.enabled)
              .map((period) => (
                <MenuItem key={period.code} value={period.code}>
                  {period.code}
                </MenuItem>
              ))}
          </AppTextField>

          <AppTextField
            label="Cupo máximo"
            onChange={(event) => {
              setCapacity(event.target.value)
              setCapacityError('')
            }}
            error={capacityError.length > 0}
            helperText={capacityError || 'Ingresa un entero mayor que cero.'}
            required
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            type="number"
            value={capacity}
          />

          <AppTextField
            select
            label="Docente (opcional)"
            onChange={(event) => setInstructorId(event.target.value)}
            value={instructorId}
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </MenuItem>
            ))}
          </AppTextField>

          <AppButton
            disabled={
              isPending ||
              isSaving ||
              subjects.length === 0 ||
              periods.length === 0
            }
            type="submit"
            variant="contained"
          >
            {isSaving ? 'Creando curso…' : 'Crear curso'}
          </AppButton>
        </Stack>
      </CardContent>
    </Card>
  )
}
