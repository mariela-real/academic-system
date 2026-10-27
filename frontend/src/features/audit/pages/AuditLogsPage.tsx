import { Card, CardContent, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { QueryState } from '../../../shared/components/QueryState'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { formatBoliviaDate } from '../../../shared/lib/bolivia-date'
import { getAuditLogs } from '../api/audit-logs'

const actionLabels: Record<string, string> = {
  'course.created': 'Curso creado',
  'course.academic_period.changed': 'Gestión del curso actualizada',
  'course.capacity.changed': 'Cupo del curso actualizado',
  'enrollment.created': 'Inscripción registrada',
  'enrollment.reactivated': 'Inscripción reactivada',
}

const resourceLabels: Record<string, string> = {
  course: 'Curso',
  enrollment: 'Inscripción',
}

export function AuditLogsPage() {
  const logsQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogs,
  })

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Consulta los 100 eventos de actividad más recientes."
        title="Auditoría académica"
      />

      <QueryState
        error={logsQuery.error}
        isError={logsQuery.isError}
        isPending={logsQuery.isPending}
        onRetry={() => void logsQuery.refetch()}
      />

      {logsQuery.data?.length === 0 ? (
        <EmptyState
          description="Las acciones administrativas registradas aparecerán aquí."
          title="Aún no hay eventos de auditoría"
        />
      ) : null}

      {logsQuery.data?.map((log) => (
        <Card key={log.id} variant="outlined">
          <CardContent>
            <Stack spacing={0.5}>
              <Typography component="h2" variant="h6">
                {actionLabels[log.action] ?? 'Actividad administrativa'}
              </Typography>
              <Typography>
                {resourceLabels[log.resourceType] ?? 'Registro académico'}
              </Typography>
              <Typography color="text.secondary">
                {log.actor.fullName} · {log.actor.email}
              </Typography>
              <Typography color="text.secondary">
                {formatBoliviaDate(log.createdAt)}
              </Typography>
              {log.reason ? (
                <Typography>Motivo: {log.reason}</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
