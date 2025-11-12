import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { User } from "@/domain/entities/User";
import { prisma } from "@/infrastructure/database/prisma";
import type { AuditContext } from "@/shared/types/auditContext";

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    audit: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;

  const mockUserData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
    name: "Test User",
    password: "$2a$10$hashedPasswordExample123456789",
    isActive: true,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
    deletedAt: null,
  };

  const mockAuditContext: AuditContext = {
    performedByUserId: "admin-user-id",
    ip: "127.0.0.1",
    userAgent: "test-agent",
    payload: { test: "data" },
  };

  beforeEach(() => {
    repository = new PrismaUserRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findAll", () => {
    it("should return all active users", async () => {
      // Arrange
      const mockUsers = [mockUserData];
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          deletedAt: null,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0]?.email).toBe(mockUserData.email);
    });

    it("should return empty array when no users found", async () => {
      // Arrange
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      // Arrange
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUserData);

      // Act
      const result = await repository.findById(mockUserData.id);

      // Assert
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: mockUserData.id, isActive: true, deletedAt: null },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUserData.id);
    });

    it("should return null when user not found", async () => {
      // Arrange
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return user when found by email", async () => {
      // Arrange
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUserData);

      // Act
      const result = await repository.findByEmail(mockUserData.email);

      // Assert
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: mockUserData.email, isActive: true, deletedAt: null },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockUserData.email);
    });

    it("should return null when user not found by email", async () => {
      // Arrange
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail("nonexistent@example.com");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user and audit log", async () => {
      // Arrange
      const user = User.create(mockUserData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUserData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(user, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserData.id);
    });

    it("should create user without audit context", async () => {
      // Arrange
      const user = User.create(mockUserData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUserData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(user);

      // Assert
      expect(result).toBeInstanceOf(User);
    });
  });

  describe("update", () => {
    it("should update user and create audit log", async () => {
      // Arrange
      const user = User.create(mockUserData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: { update: vi.fn().mockResolvedValue(mockUserData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.update(user, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserData.id);
    });

    it("should update user without audit context", async () => {
      // Arrange
      const user = User.create(mockUserData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: { update: vi.fn().mockResolvedValue(mockUserData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.update(user);

      // Assert
      expect(result).toBeInstanceOf(User);
    });
  });

  describe("delete", () => {
    it("should soft delete user and create audit log", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({
              ...mockUserData,
              isActive: false,
              deletedAt: new Date(),
            }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      await repository.delete(mockUserData.id, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should soft delete user without audit context", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({
              ...mockUserData,
              isActive: false,
              deletedAt: new Date(),
            }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      await repository.delete(mockUserData.id);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
