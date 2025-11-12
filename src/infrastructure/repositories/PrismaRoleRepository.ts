import { Role } from '@/domain/entities/Role';
import type { IRoleRepository } from '@/domain/interfaces/IRoleRepository';
import { RoleName } from '@/domain/value-objects/RoleName';
import { prisma } from '@/infrastructure/database/prisma';
import type { AuditContext } from '@/shared/types/auditContext';
import { formatPayloadForAudit } from '@/shared/types/auditContext';

export class PrismaRoleRepository implements IRoleRepository {
  async findAll(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });

    return roles.map((role) =>
      Role.create({
        id: role.id,
        name: role.name as RoleName,
        description: role.description ?? null,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        deletedAt: role.deletedAt,
      })
    );
  }

  async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });

    if (!role) return null;

    return Role.create({
      id: role.id,
      name: role.name as RoleName,
      description: role.description ?? null,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
    });
  }

  async findByName(name: RoleName): Promise<Role | null> {
    const role = await prisma.role.findFirst({
      where: { name, isActive: true, deletedAt: null },
    });
    if (!role) return null;

    return Role.create({
      id: role.id,
      name: role.name as RoleName,
      description: role.description ?? null,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
    });
  }

  async create(role: Role, auditCtx?: AuditContext): Promise<Role> {
    const created = await prisma.$transaction(async (tx) => {
      const dbRole = await tx.role.create({
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
          deletedAt: role.deletedAt,
        },
      });

      await tx.audit.create({
        data: {
          entity: 'Role',
          entityId: dbRole.id,
          action: 'CREATE',
          userId: auditCtx?.performedByUserId ?? null,
          ip: auditCtx?.ip ?? null,
          userAgent: auditCtx?.userAgent ?? null,
          payload: formatPayloadForAudit(auditCtx?.payload),
        },
      });

      return dbRole;
    });

    return Role.create({
      id: created.id,
      name: created.name as RoleName,
      description: created.description ?? null,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
  }

  async update(role: Role, auditCtx?: AuditContext): Promise<Role> {
    const updated = await prisma.$transaction(async (tx) => {
      const dbRole = await tx.role.update({
        where: { id: role.id },
        data: {
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          updatedAt: role.updatedAt,
          deletedAt: role.deletedAt,
        },
      });

      await tx.audit.create({
        data: {
          entity: 'Role',
          entityId: dbRole.id,
          action: 'UPDATE',
          userId: auditCtx?.performedByUserId ?? null,
          ip: auditCtx?.ip ?? null,
          userAgent: auditCtx?.userAgent ?? null,
          payload: formatPayloadForAudit(auditCtx?.payload),
        },
      });

      return dbRole;
    });

    return Role.create({
      id: updated.id,
      name: updated.name as RoleName,
      description: updated.description ?? null,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
    });
  }

  async delete(id: string, auditCtx?: AuditContext): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const dbRole = await tx.role.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      await tx.audit.create({
        data: {
          entity: 'Role',
          entityId: dbRole.id,
          action: 'SOFT_DELETE',
          userId: auditCtx?.performedByUserId ?? null,
          ip: auditCtx?.ip ?? null,
          userAgent: auditCtx?.userAgent ?? null,
          payload: formatPayloadForAudit(auditCtx?.payload),
        },
      });
    });
  }
}
