export type AuditLogResponse = {
  id: string;
  actor: {
    id: string;
    email: string;
    fullName: string;
  };
  action: string;
  resourceType: string;
  resourceId: string;
  reason: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
};
