import { RefreshToken } from "@/domain/entities/RefreshToken";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import { prisma } from "@/infrastructure/database/prisma";
import type { AuditContext } from "@/shared/types/auditContext";
import { createAuditLog } from "@/infrastructure/helpers/auditHelper";
import { ENTITY_NAMES } from "@/shared/constants/entities";

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async create(
    refreshToken: RefreshToken,
    auditContext?: AuditContext,
  ): Promise<RefreshToken> {
    const created = await prisma.$transaction(async (tx) => {
      const dbRefreshToken = await tx.refreshToken.create({
        data: {
          id: refreshToken.id,
          token: refreshToken.token,
          userId: refreshToken.userId,
          expiresAt: refreshToken.expiresAt,
          createdAt: refreshToken.createdAt,
          updatedAt: refreshToken.updatedAt,
          deletedAt: refreshToken.deletedAt,
        },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.REFRESH_TOKEN,
        dbRefreshToken.id,
        "CREATE",
        auditContext,
      );

      return dbRefreshToken;
    });

    return RefreshToken.create({
      id: created.id,
      token: created.token,
      userId: created.userId,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        token,
        deletedAt: null,
      },
    });

    if (!refreshToken) return null;

    return RefreshToken.create({
      id: refreshToken.id,
      token: refreshToken.token,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
      updatedAt: refreshToken.updatedAt,
      deletedAt: refreshToken.deletedAt,
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        deletedAt: null,
      },
    });

    return tokens.map((token) =>
      RefreshToken.create({
        id: token.id,
        token: token.token,
        userId: token.userId,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        deletedAt: token.deletedAt,
      }),
    );
  }

  async deleteByToken(
    token: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const refreshToken = await tx.refreshToken.findFirst({
        where: { token, deletedAt: null },
      });

      if (!refreshToken) return;

      await tx.refreshToken.updateMany({
        where: { token },
        data: { deletedAt: new Date() },
      });

      await createAuditLog(
        tx,
        ENTITY_NAMES.REFRESH_TOKEN,
        refreshToken.id,
        "SOFT_DELETE",
        auditContext,
      );
    });
  }

  async deleteAllByUserId(
    userId: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const refreshTokens = await tx.refreshToken.findMany({
        where: { userId, deletedAt: null },
      });

      if (refreshTokens.length === 0) return;

      await tx.refreshToken.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      for (const token of refreshTokens) {
        await createAuditLog(
          tx,
          ENTITY_NAMES.REFRESH_TOKEN,
          token.id,
          "SOFT_DELETE",
          auditContext,
        );
      }
    });
  }
}
