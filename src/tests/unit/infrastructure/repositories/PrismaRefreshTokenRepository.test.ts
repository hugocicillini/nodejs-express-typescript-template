import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaRefreshTokenRepository } from "@/infrastructure/repositories/PrismaRefreshTokenRepository";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import { prisma } from "@/infrastructure/database/prisma";

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    audit: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("PrismaRefreshTokenRepository", () => {
  let repository: PrismaRefreshTokenRepository;

  const mockTokenData = {
    id: "880e8400-e29b-41d4-a716-446655440000",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validToken",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    expiresAt: new Date("2025-12-31T23:59:59Z"),
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
    deletedAt: null,
  };

  beforeEach(() => {
    repository = new PrismaRefreshTokenRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("create", () => {
    it("should create refresh token", async () => {
      // Arrange
      const token = RefreshToken.create(mockTokenData);

      vi.mocked(prisma.$transaction).mockImplementation(
        async (callback: any) => {
          const tx = {
            refreshToken: {
              create: vi.fn().mockResolvedValue(mockTokenData),
            },
            audit: {
              create: vi.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      // Act
      const result = await repository.create(token);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.token).toBe(mockTokenData.token);
    });
  });

  describe("findByToken", () => {
    it("should return token when found", async () => {
      // Arrange
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(mockTokenData);

      // Act
      const result = await repository.findByToken(mockTokenData.token);

      // Assert
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: mockTokenData.token,
          deletedAt: null,
        },
      });
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.token).toBe(mockTokenData.token);
    });

    it("should return null when token not found", async () => {
      // Arrange
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findByToken("non-existent-token");

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when token is deleted", async () => {
      // Arrange
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findByToken(mockTokenData.token);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return all tokens for user", async () => {
      // Arrange
      const mockTokens = [mockTokenData];
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue(mockTokens);

      // Act
      const result = await repository.findByUserId(mockTokenData.userId);

      // Assert
      expect(prisma.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockTokenData.userId,
          deletedAt: null,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RefreshToken);
      expect(result[0]?.userId).toBe(mockTokenData.userId);
    });

    it("should return empty array when no tokens found", async () => {
      // Arrange
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findByUserId("user-without-tokens");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("deleteByToken", () => {
    it("should soft delete token by token string", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(
        async (callback: any) => {
          const tx = {
            refreshToken: {
              findFirst: vi.fn().mockResolvedValue(mockTokenData),
              updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            },
            audit: {
              create: vi.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      // Act
      await repository.deleteByToken(mockTokenData.token);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should handle deletion of non-existent token", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(
        async (callback: any) => {
          const tx = {
            refreshToken: {
              findFirst: vi.fn().mockResolvedValue(null),
              updateMany: vi.fn(),
            },
            audit: {
              create: vi.fn(),
            },
          };
          return callback(tx);
        },
      );

      // Act
      await repository.deleteByToken("non-existent-token");

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("deleteAllByUserId", () => {
    it("should soft delete all tokens for user", async () => {
      // Arrange
      const mockTokens = [mockTokenData, { ...mockTokenData, id: "token-2" }];

      vi.mocked(prisma.$transaction).mockImplementation(
        async (callback: any) => {
          const tx = {
            refreshToken: {
              findMany: vi.fn().mockResolvedValue(mockTokens),
              updateMany: vi.fn().mockResolvedValue({ count: 2 }),
            },
            audit: {
              create: vi.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      // Act
      await repository.deleteAllByUserId(mockTokenData.userId);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should handle user with no tokens", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(
        async (callback: any) => {
          const tx = {
            refreshToken: {
              findMany: vi.fn().mockResolvedValue([]),
              updateMany: vi.fn(),
            },
            audit: {
              create: vi.fn(),
            },
          };
          return callback(tx);
        },
      );

      // Act
      await repository.deleteAllByUserId("user-without-tokens");

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
