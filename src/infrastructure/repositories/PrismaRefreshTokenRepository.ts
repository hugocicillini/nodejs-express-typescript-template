import { RefreshToken } from "@/domain/entities/RefreshToken";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import { prisma } from "@/infrastructure/database/prisma";

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await prisma.refreshToken.create({
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

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { deletedAt: new Date() },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
