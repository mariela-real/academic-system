import {
  apiRequest,
  expectArray,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type AuditLog = {
  id: string
  action: string
  resourceType: string
  resourceId: string
  reason: string | null
  createdAt: string
  actor: { id: string; email: string; fullName: string }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return expectArray(
    await apiRequest('/audit-logs'),
    'eventos de auditoría',
  ).map(parseAuditLog)
}

function parseAuditLog(value: unknown): AuditLog {
  const record = expectRecord(value, 'evento de auditoría')
  const actor = expectRecord(record.actor, 'usuario responsable')

  return {
    id: expectString(record.id, 'id'),
    action: expectString(record.action, 'action'),
    resourceType: expectString(record.resourceType, 'resourceType'),
    resourceId: expectString(record.resourceId, 'resourceId'),
    reason: record.reason === null ? null : expectString(record.reason, 'reason'),
    createdAt: expectString(record.createdAt, 'createdAt'),
    actor: {
      id: expectString(actor.id, 'actor.id'),
      email: expectString(actor.email, 'actor.email'),
      fullName: expectString(actor.fullName, 'actor.fullName'),
    },
  }
}
