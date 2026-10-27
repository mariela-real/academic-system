import type { AuthUser } from '../../auth/types/auth-user'

export type DashboardTab =
  | 'overview'
  | 'courses'
  | 'enrollments'
  | 'grades'
  | 'history'
  | 'periods'
  | 'subjects'
  | 'students'
  | 'teachers'
  | 'users'
  | 'audit'

export type DashboardNavigationItem = {
  value: DashboardTab
  label: string
}

export type DashboardNavigationSection = {
  label: string
  items: DashboardNavigationItem[]
}

export function getDashboardNavigation(
  role: AuthUser['role'],
): DashboardNavigationSection[] {
  const academicItems: DashboardNavigationItem[] = [
    { value: 'overview', label: 'Inicio' },
    { value: 'courses', label: 'Oferta académica' },
    { value: 'enrollments', label: 'Inscripciones' },
    { value: 'grades', label: 'Calificaciones' },
    { value: 'history', label: 'Historial académico' },
  ]

  if (role !== 'admin') {
    return [{ label: 'Espacio académico', items: academicItems }]
  }

  return [
    { label: 'Espacio académico', items: academicItems },
    {
      label: 'Administración',
      items: [
        { value: 'periods', label: 'Gestiones' },
        { value: 'subjects', label: 'Materias' },
        { value: 'students', label: 'Estudiantes' },
        { value: 'teachers', label: 'Docentes' },
        { value: 'users', label: 'Usuarios' },
        { value: 'audit', label: 'Auditoría' },
      ],
    },
  ]
}
