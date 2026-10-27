import { useState } from 'react'
import {
  AccountCircleOutlined,
  AutoStoriesOutlined,
  CoPresentOutlined,
  DashboardOutlined,
  EventNoteOutlined,
  FactCheckOutlined,
  GroupsOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuBookOutlined,
  SchoolOutlined,
  TodayOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppLayout } from '../../../shared/ui/AppLayout'
import { getApiHealth } from '../../../shared/api/health'
import { logout } from '../../auth/api/auth'
import type { AuthUser } from '../../auth/types/auth-user'
import { AcademicHistoryPage } from '../../academic-history/pages/AcademicHistoryPage'
import { AcademicPeriodsPage } from '../../academic-periods/pages/AcademicPeriodsPage'
import { AuditLogsPage } from '../../audit/pages/AuditLogsPage'
import { CoursesPage } from '../../courses/pages/CoursesPage'
import { EnrollmentsPage } from '../../enrollments/pages/EnrollmentsPage'
import { GradesPage } from '../../grades/pages/GradesPage'
import { StudentsPage } from '../../students/pages/StudentsPage'
import { SubjectsPage } from '../../subjects/pages/SubjectsPage'
import { UsersPage } from '../../auth/pages/UsersPage'
import { TeachersPage } from '../../teachers/pages/TeachersPage'
import { DashboardOverview } from './DashboardOverview'
import {
  getDashboardNavigation,
  type DashboardTab,
} from '../lib/dashboard-navigation'

type AcademicDashboardProps = {
  user: AuthUser
}

const navigationIcons = {
  overview: <DashboardOutlined />,
  courses: <MenuBookOutlined />,
  enrollments: <EventNoteOutlined />,
  grades: <FactCheckOutlined />,
  history: <HistoryOutlined />,
  periods: <TodayOutlined />,
  subjects: <AutoStoriesOutlined />,
  students: <GroupsOutlined />,
  teachers: <CoPresentOutlined />,
  users: <AccountCircleOutlined />,
  audit: <SchoolOutlined />,
} satisfies Record<DashboardTab, ReactNode>

export function AcademicDashboard({ user }: AcademicDashboardProps) {
  const queryClient = useQueryClient()
  const navigationSections = getDashboardNavigation(user.role)
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('overview')
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getApiHealth,
  })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      window.location.replace('/')
    },
  })

  function selectNavigationItem(tab: DashboardTab) {
    setSelectedTab(tab)
  }

  const navigation = (
    <Box component="nav" aria-label="Navegación principal" sx={{ py: 2 }}>
      {navigationSections.map((section, index) => (
        <Box key={section.label}>
          {index > 0 ? <Divider sx={{ my: 1.5, mx: 2 }} /> : null}
          <List
            dense
            subheader={
              <ListSubheader
                disableGutters
                sx={{
                  bgcolor: 'transparent',
                  color: 'text.secondary',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  lineHeight: '32px',
                  mx: 2,
                  textTransform: 'uppercase',
                }}
              >
                {section.label}
              </ListSubheader>
            }
            sx={{ px: 1.5 }}
          >
            {section.items.map((item) => (
              <ListItemButton
                aria-current={selectedTab === item.value ? 'page' : undefined}
                key={item.value}
                onClick={() => selectNavigationItem(item.value)}
                selected={selectedTab === item.value}
                sx={{
                  borderRadius: 2.5,
                  minHeight: 44,
                  mb: 0.5,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light' },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selectedTab === item.value ? 'primary.main' : 'text.secondary',
                    minWidth: 38,
                  }}
                >
                  {navigationIcons[item.value]}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: selectedTab === item.value ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  )

  return (
    <AppLayout
      headerActions={
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1.5 }}
          sx={{ alignItems: 'center' }}
        >
          <Avatar
            aria-hidden="true"
            sx={{
              bgcolor: 'primary.light',
              color: 'primary.main',
              display: { xs: 'none', sm: 'flex' },
              fontSize: '0.875rem',
              fontWeight: 700,
              height: 36,
              width: 36,
            }}
          >
            {getInitials(user.fullName)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontWeight: 600, maxWidth: 180 }}
              variant="body2"
            >
              {user.fullName}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {getRoleName(user.role)}
            </Typography>
          </Box>
          <Chip
            color="primary"
            label={getRoleName(user.role)}
            size="small"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            variant="outlined"
          />
          <AppButton
            aria-label="Cerrar sesión"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            size="small"
            startIcon={<LogoutOutlined />}
            variant="outlined"
          >
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              Cerrar sesión
            </Box>
          </AppButton>
        </Stack>
      }
      navigation={navigation}
      title="Sistema Académico UNICEN"
    >
      <Stack spacing={2.5}>
        {logoutMutation.isError ? (
          <Alert severity="error">
            No se pudo cerrar la sesión. Inténtalo nuevamente.
          </Alert>
        ) : null}

        {healthQuery.isError ? (
          <Alert severity="warning">
            No se pudo verificar el estado de la API. Las operaciones mostrarán
            su error si el servicio no está disponible.
          </Alert>
        ) : null}

        <DashboardContent
          onNavigate={selectNavigationItem}
          tab={selectedTab}
          user={user}
        />
      </Stack>
    </AppLayout>
  )
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart[0].toLocaleUpperCase())
    .join('')
}

function getRoleName(role: AuthUser['role']): string {
  if (role === 'admin') {
    return 'Administrador'
  }

  if (role === 'teacher') {
    return 'Docente'
  }

  return 'Estudiante'
}

function DashboardContent({
  tab,
  user,
  onNavigate,
}: {
  tab: DashboardTab
  user: AuthUser
  onNavigate: (tab: DashboardTab) => void
}) {
  if (tab === 'overview') {
    return <DashboardOverview onNavigate={onNavigate} user={user} />
  }

  if (tab === 'courses') {
    return <CoursesPage user={user} />
  }

  if (tab === 'enrollments') {
    return <EnrollmentsPage user={user} />
  }

  if (tab === 'grades') {
    return <GradesPage user={user} />
  }

  if (tab === 'history') {
    return <AcademicHistoryPage user={user} />
  }

  if (tab === 'periods' && user.role === 'admin') {
    return <AcademicPeriodsPage />
  }

  if (tab === 'subjects' && user.role === 'admin') {
    return <SubjectsPage />
  }

  if (tab === 'students' && user.role === 'admin') {
    return <StudentsPage />
  }

  if (tab === 'users' && user.role === 'admin') {
    return <UsersPage />
  }

  if (tab === 'teachers' && user.role === 'admin') {
    return <TeachersPage />
  }

  if (tab === 'audit' && user.role === 'admin') {
    return <AuditLogsPage />
  }

  return <Alert severity="error">La sección solicitada no está disponible.</Alert>
}
