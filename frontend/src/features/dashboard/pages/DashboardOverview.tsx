import {
  ArrowForward,
  AutoStoriesOutlined,
  GroupsOutlined,
  HowToRegOutlined,
  SchoolOutlined,
  TodayOutlined,
} from '@mui/icons-material'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { AuthUser } from '../../auth/types/auth-user'
import { getAcademicPeriods } from '../../academic-periods/api/academic-periods'
import { getCourses } from '../../courses/api/courses'
import { getEnrollments } from '../../enrollments/api/enrollments'
import { getGrades } from '../../grades/api/grades'
import { getStudents } from '../../students/api/students'
import { AppButton } from '../../../shared/ui/AppButton'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import type { DashboardTab } from '../lib/dashboard-navigation'

type DashboardOverviewProps = {
  user: AuthUser
  onNavigate: (tab: DashboardTab) => void
}

type DashboardMetricCardProps = {
  label: string
  value?: number
  detail: string
  icon: ReactNode
  isPending: boolean
  isError: boolean
}

export function DashboardOverview({
  user,
  onNavigate,
}: DashboardOverviewProps) {
  const isAdministrator = user.role === 'admin'
  const isTeacher = user.role === 'teacher'
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })
  const enrollmentsQuery = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
  })
  const periodsQuery = useQuery({
    queryKey: ['academic-periods'],
    queryFn: getAcademicPeriods,
    enabled: isAdministrator,
  })
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
    enabled: isAdministrator,
  })
  const gradesQuery = useQuery({
    queryKey: ['grades'],
    queryFn: getGrades,
    enabled: isAdministrator || isTeacher,
  })

  const activeEnrollments = enrollmentsQuery.data?.filter(
    (enrollment) => enrollment.status === 'active',
  )
  const greetingName = user.fullName.split(' ')[0]
  const metrics = [
    {
      label: 'Cursos ofertados',
      value: coursesQuery.data?.length,
      detail: 'En todas las gestiones disponibles',
      icon: <AutoStoriesOutlined />,
      isPending: coursesQuery.isPending,
      isError: coursesQuery.isError,
    },
    {
      label: 'Inscripciones activas',
      value: activeEnrollments?.length,
      detail: 'Registros vigentes en tus cursos',
      icon: <HowToRegOutlined />,
      isPending: enrollmentsQuery.isPending,
      isError: enrollmentsQuery.isError,
    },
    ...(isAdministrator
      ? [
          {
            label: 'Estudiantes',
            value: studentsQuery.data?.length,
            detail: 'Perfiles estudiantiles registrados',
            icon: <GroupsOutlined />,
            isPending: studentsQuery.isPending,
            isError: studentsQuery.isError,
          },
          {
            label: 'Gestiones habilitadas',
            value: periodsQuery.data?.filter((period) => period.enabled).length,
            detail: 'Catálogo académico vigente',
            icon: <TodayOutlined />,
            isPending: periodsQuery.isPending,
            isError: periodsQuery.isError,
          },
          {
            label: 'Calificaciones',
            value: gradesQuery.data?.length,
            detail: 'Notas registradas en el sistema',
            icon: <SchoolOutlined />,
            isPending: gradesQuery.isPending,
            isError: gradesQuery.isError,
          },
        ]
      : isTeacher
        ? [
            {
              label: 'Calificaciones',
              value: gradesQuery.data?.length,
              detail: 'Notas registradas en tus cursos',
              icon: <SchoolOutlined />,
              isPending: gradesQuery.isPending,
              isError: gradesQuery.isError,
            },
          ]
        : []),
  ]

  return (
    <Stack spacing={3}>
      <PageHeader
        description="Consulta el resumen académico y accede rápidamente a tus tareas."
        title={`Bienvenido, ${greetingName}`}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {metrics.map((metric) => (
          <DashboardMetricCard
            detail={metric.detail}
            icon={metric.icon}
            isError={metric.isError}
            isPending={metric.isPending}
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </Box>

      {coursesQuery.isError || enrollmentsQuery.isError ? (
        <ErrorState
          error={
            coursesQuery.error instanceof Error
              ? coursesQuery.error
              : enrollmentsQuery.error
          }
        />
      ) : null}

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography component="h2" variant="h5">
                Accesos directos
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Continúa con tus actividades académicas.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <AppButton
                endIcon={<ArrowForward />}
                onClick={() => onNavigate('courses')}
                variant="contained"
              >
                Ver oferta académica
              </AppButton>
              <AppButton
                onClick={() => onNavigate('enrollments')}
                variant="outlined"
              >
                Inscripciones
              </AppButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

function DashboardMetricCard({
  label,
  value,
  detail,
  icon,
  isPending,
  isError,
}: DashboardMetricCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            <Typography
              component="p"
              sx={{ lineHeight: 1.15, mt: 1 }}
              variant="h3"
            >
              {isError ? '—' : isPending ? '…' : (value ?? 0)}
            </Typography>
          </Box>
          <Box
            aria-hidden="true"
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.light',
              borderRadius: 2.5,
              color: 'primary.main',
              display: 'flex',
              flexShrink: 0,
              height: 42,
              justifyContent: 'center',
              width: 42,
              '& svg': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 2 }} variant="caption">
          {isError ? 'No se pudo consultar este indicador.' : detail}
        </Typography>
      </CardContent>
    </Card>
  )
}
