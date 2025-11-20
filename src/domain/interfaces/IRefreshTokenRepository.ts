import type { AuditContext } from "@/shared/types/auditContext";
import type { RefreshToken } from "../entities/RefreshToken";

export interface IRefreshTokenRepository {
  create(
    refreshToken: RefreshToken,
    auditContext?: AuditContext,
  ): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  deleteByToken(token: string, auditContext?: AuditContext): Promise<void>;
  deleteAllByUserId(userId: string, auditContext?: AuditContext): Promise<void>;
}
