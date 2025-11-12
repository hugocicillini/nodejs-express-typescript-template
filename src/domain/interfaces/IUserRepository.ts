import type { User } from "../entities/User";
import type { AuditContext } from "@/shared/types/auditContext";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User, auditCtx?: AuditContext): Promise<User>;
  update(user: User, auditCtx?: AuditContext): Promise<User>;
  delete(id: string, auditCtx?: AuditContext): Promise<void>;
}
