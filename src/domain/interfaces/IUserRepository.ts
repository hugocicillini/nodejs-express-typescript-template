import type { User } from "../entities/User";
import type { AuditContext } from "@/shared/types/auditContext";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User, auditContext?: AuditContext): Promise<User>;
  update(user: User, auditContext?: AuditContext): Promise<User>;
  delete(id: string, auditContext?: AuditContext): Promise<void>;
}
