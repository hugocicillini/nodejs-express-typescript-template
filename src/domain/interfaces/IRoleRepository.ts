import type { Role } from "@/domain/entities/Role";
import type { AuditContext } from "@/shared/types/auditContext";

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(role: Role, auditContext?: AuditContext): Promise<Role>;
  update(role: Role, auditContext?: AuditContext): Promise<Role>;
  delete(id: string, auditContext?: AuditContext): Promise<void>;
}
