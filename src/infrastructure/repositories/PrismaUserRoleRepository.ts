import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { prisma } from "@/infrastructure/database/prisma";
import type { AuditContext } from "@/shared/types/auditContext";
import { formatPayloadForAudit } from "@/shared/types/auditContext";

export class PrismaUserRoleRepository implements IUserRoleRepository {
  async findAll(): Promise<UserRole[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        isActive: true,
      },
    });

    return userRoles.map((ur) =>
      UserRole.create({
        id: ur.id,
        userId: ur.userId,
        roleId: ur.roleId,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
        expiresAt: ur.expiresAt,
        isActive: ur.isActive,
      }),
    );
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return userRoles.map((ur) =>
      UserRole.create({
        id: ur.id,
        userId: ur.userId,
        roleId: ur.roleId,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
        expiresAt: ur.expiresAt,
        isActive: ur.isActive,
      }),
    );
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        roleId,
        isActive: true,
      },
    });

    return userRoles.map((ur) =>
      UserRole.create({
        id: ur.id,
        userId: ur.userId,
        roleId: ur.roleId,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
        expiresAt: ur.expiresAt,
        isActive: ur.isActive,
      }),
    );
  }

  async findByUserAndRole(
    userId: string,
    roleId: string,
  ): Promise<UserRole | null> {
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
        isActive: true,
      },
    });

    if (!userRole) return null;

    return UserRole.create({
      id: userRole.id,
      userId: userRole.userId,
      roleId: userRole.roleId,
      assignedAt: userRole.assignedAt,
      assignedBy: userRole.assignedBy,
      expiresAt: userRole.expiresAt,
      isActive: userRole.isActive,
    });
  }

  async create(userRole: UserRole, auditCtx?: AuditContext): Promise<UserRole> {
    const created = await prisma.$transaction(async (tx) => {
      const dbUserRole = await tx.userRole.create({
        data: {
          id: userRole.id,
          userId: userRole.userId,
          roleId: userRole.roleId,
          assignedAt: userRole.assignedAt,
          assignedBy: userRole.assignedBy,
          expiresAt: userRole.expiresAt,
          isActive: userRole.isActive,
        },
      });

      await tx.audit.create({
        data: {
          entity: "UserRole",
          entityId: dbUserRole.id,
          action: "CREATE",
          userId: auditCtx?.performedByUserId ?? null,
          ip: auditCtx?.ip ?? null,
          userAgent: auditCtx?.userAgent ?? null,
          payload: formatPayloadForAudit(auditCtx?.payload),
        },
      });

      return dbUserRole;
    });

    return UserRole.create({
      id: created.id,
      userId: created.userId,
      roleId: created.roleId,
      assignedAt: created.assignedAt,
      assignedBy: created.assignedBy,
      expiresAt: created.expiresAt,
      isActive: created.isActive,
    });
  }

  async deleteByUserAndRole(
    userId: string,
    roleId: string,
    auditCtx?: AuditContext,
  ): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        const userRole = await tx.userRole.findUnique({
          where: {
            userId_roleId: {
              userId,
              roleId,
            },
          },
        });

        if (!userRole) {
          throw new Error("UserRole not found");
        }

        await tx.userRole.update({
          where: {
            userId_roleId: {
              userId,
              roleId,
            },
          },
          data: { isActive: false },
        });

        await tx.audit.create({
          data: {
            entity: "UserRole",
            entityId: userRole.id,
            action: "DELETE",
            userId: auditCtx?.performedByUserId ?? null,
            ip: auditCtx?.ip ?? null,
            userAgent: auditCtx?.userAgent ?? null,
            payload: formatPayloadForAudit(auditCtx?.payload),
          },
        });
      });

      return true;
    } catch (error: any) {
      if (error.message === "UserRole not found") {
        return false;
      }
      throw error;
    }
  }

  async deleteAllByUserId(
    userId: string,
    auditCtx?: AuditContext,
  ): Promise<number> {
    const result = await prisma.$transaction(async (tx) => {
      const userRoles = await tx.userRole.findMany({
        where: { userId, isActive: true },
      });

      const deleteResult = await tx.userRole.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      for (const userRole of userRoles) {
        await tx.audit.create({
          data: {
            entity: "UserRole",
            entityId: userRole.id,
            action: "DELETE",
            userId: auditCtx?.performedByUserId ?? null,
            ip: auditCtx?.ip ?? null,
            userAgent: auditCtx?.userAgent ?? null,
            payload: formatPayloadForAudit(auditCtx?.payload),
          },
        });
      }

      return deleteResult.count;
    });

    return result;
  }

  async deleteAllByRoleId(
    roleId: string,
    auditCtx?: AuditContext,
  ): Promise<number> {
    const result = await prisma.$transaction(async (tx) => {
      const userRoles = await tx.userRole.findMany({
        where: { roleId, isActive: true },
      });

      const deleteResult = await tx.userRole.updateMany({
        where: { roleId, isActive: true },
        data: { isActive: false },
      });

      for (const userRole of userRoles) {
        await tx.audit.create({
          data: {
            entity: "UserRole",
            entityId: userRole.id,
            action: "DELETE",
            userId: auditCtx?.performedByUserId ?? null,
            ip: auditCtx?.ip ?? null,
            userAgent: auditCtx?.userAgent ?? null,
            payload: formatPayloadForAudit(auditCtx?.payload),
          },
        });
      }

      return deleteResult.count;
    });

    return result;
  }

  async userHasRole(userId: string, roleId: string): Promise<boolean> {
    const userRole = await this.findByUserAndRole(userId, roleId);
    return userRole !== null && userRole.isActive;
  }
}
