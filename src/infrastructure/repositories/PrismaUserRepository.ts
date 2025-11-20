import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import { createAuditLog } from "@/infrastructure/helpers/auditHelper";
import { prisma } from "@/infrastructure/database/prisma";
import { ENTITY_NAMES } from "@/shared/constants/entities";

export class PrismaUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });

    return users.map((user) =>
      User.create({
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      }),
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }

  async create(user: User, auditContext?: AuditContext): Promise<User> {
    const created = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.USER,
        dbUser.id,
        "CREATE",
        auditContext,
      );

      return dbUser;
    });

    return User.create({
      id: created.id,
      email: created.email,
      name: created.name,
      password: created.password,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
  }

  async update(user: User, auditContext?: AuditContext): Promise<User> {
    const updated = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          password: user.password,
          isActive: user.isActive,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.USER,
        dbUser.id,
        "UPDATE",
        auditContext,
      );

      return dbUser;
    });

    return User.create({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      password: updated.password,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
    });
  }

  async delete(id: string, auditContext?: AuditContext): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.USER,
        dbUser.id,
        "SOFT_DELETE",
        auditContext,
      );
    });
  }
}
