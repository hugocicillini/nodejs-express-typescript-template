import type { AuditContext } from "@/shared/types/auditContext";
import {
  formatPayloadForAudit,
  type AuditAction,
} from "@/shared/types/auditContext";
import type { PrismaClient } from "@prisma/client";

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function createAuditLog(
  tx: PrismaTransaction,
  entity: string,
  entityId: string,
  action: AuditAction,
  auditContext?: AuditContext,
): Promise<void> {
  await tx.audit.create({
    data: {
      entity,
      entityId,
      action,
      userId: auditContext?.performedByUserId ?? null,
      ip: auditContext?.ip ?? null,
      userAgent: auditContext?.userAgent ?? null,
      payload: formatPayloadForAudit(auditContext?.payload),
    },
  });
}
