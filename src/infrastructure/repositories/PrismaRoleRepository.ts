import { Role } from "@/domain/entities/Role";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { RoleName } from "@/domain/value-objects/RoleName";
import { prisma } from "@/infrastructure/database/prisma";
import { createAuditLog } from "@/infrastructure/helpers/auditHelper";
import type { AuditContext } from "@/shared/types/auditContext";
import { ENTITY_NAMES } from "@/shared/constants/entities";

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
      }),
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

  async create(role: Role, auditContext?: AuditContext): Promise<Role> {
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

      await createAuditLog(
        tx,
        ENTITY_NAMES.ROLE,
        dbRole.id,
        "CREATE",
        auditContext,
      );

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

  async update(role: Role, auditContext?: AuditContext): Promise<Role> {
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

      await createAuditLog(
        tx,
        ENTITY_NAMES.ROLE,
        dbRole.id,
        "UPDATE",
        auditContext,
      );

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

  async delete(id: string, auditContext?: AuditContext): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const dbRole = await tx.role.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.ROLE,
        dbRole.id,
        "SOFT_DELETE",
        auditContext,
      );
    });
  }
}
