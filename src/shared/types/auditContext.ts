import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "SOFT_DELETE"
  | "HARD_DELETE"
  | "LOGIN"
  | "LOGOUT";

export interface AuditContext {
  performedByUserId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  payload?: unknown;
}

export function formatPayloadForAudit(payload: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(payload ?? {})) as Prisma.InputJsonValue;
}
