import type { AuditContext } from "@/shared/types/auditContext";
import type { UserRole } from "../entities/UserRole";

export interface IUserRoleRepository {
  findAll(): Promise<UserRole[]>;
  findByUserId(userId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  create(userRole: UserRole, auditCtx?: AuditContext): Promise<UserRole>;
  deleteByUserAndRole(
    userId: string,
    roleId: string,
    auditCtx?: AuditContext,
  ): Promise<boolean>;
  deleteAllByUserId(userId: string, auditCtx?: AuditContext): Promise<number>;
  deleteAllByRoleId(roleId: string, auditCtx?: AuditContext): Promise<number>;
  userHasRole(userId: string, roleId: string): Promise<boolean>;
}
