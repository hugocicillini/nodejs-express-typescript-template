import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaUserRoleRepository } from "@/infrastructure/repositories/PrismaUserRoleRepository";
import { UserRole } from "@/domain/entities/UserRole";
import { prisma } from "@/infrastructure/database/prisma";
import type { AuditContext } from "@/shared/types/auditContext";

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    userRole: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    audit: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("PrismaUserRoleRepository", () => {
  let repository: PrismaUserRoleRepository;

  const mockUserRoleData = {
    id: "770e8400-e29b-41d4-a716-446655440000",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    roleId: "660e8400-e29b-41d4-a716-446655440000",
    assignedAt: new Date("2024-01-01T10:00:00Z"),
    assignedBy: null,
    expiresAt: null,
    isActive: true,
  };

  const mockAuditContext: AuditContext = {
    performedByUserId: "admin-user-id",
    ip: "127.0.0.1",
    userAgent: "test-agent",
    payload: { test: "data" },
  };

  beforeEach(() => {
    repository = new PrismaUserRoleRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findAll", () => {
    it("should return all active user roles", async () => {
      // Arrange
      const mockUserRoles = [mockUserRoleData];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(mockUserRoles);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserRole);
    });

    it("should return empty array when no user roles found", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByUserId", () => {
    it("should return all roles for user", async () => {
      // Arrange
      const mockUserRoles = [mockUserRoleData];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(mockUserRoles);

      // Act
      const result = await repository.findByUserId(mockUserRoleData.userId);

      // Assert
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserRoleData.userId,
          isActive: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userId).toBe(mockUserRoleData.userId);
    });

    it("should return empty array when user has no roles", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findByUserId("user-without-roles");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByRoleId", () => {
    it("should return all users with role", async () => {
      // Arrange
      const mockUserRoles = [mockUserRoleData];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(mockUserRoles);

      // Act
      const result = await repository.findByRoleId(mockUserRoleData.roleId);

      // Assert
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: {
          roleId: mockUserRoleData.roleId,
          isActive: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.roleId).toBe(mockUserRoleData.roleId);
    });

    it("should return empty array when role has no users", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findByRoleId("role-without-users");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByUserAndRole", () => {
    it("should return user role when found", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findUnique).mockResolvedValue(mockUserRoleData);

      // Act
      const result = await repository.findByUserAndRole(
        mockUserRoleData.userId,
        mockUserRoleData.roleId,
      );

      // Assert
      expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
        where: {
          userId_roleId: {
            userId: mockUserRoleData.userId,
            roleId: mockUserRoleData.roleId,
          },
          isActive: true,
        },
      });
      expect(result).toBeInstanceOf(UserRole);
      expect(result?.userId).toBe(mockUserRoleData.userId);
      expect(result?.roleId).toBe(mockUserRoleData.roleId);
    });

    it("should return null when user role not found", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.findByUserAndRole("user-id", "role-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user role and audit log", async () => {
      // Arrange
      const userRole = UserRole.create(mockUserRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: { create: vi.fn().mockResolvedValue(mockUserRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(userRole, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UserRole);
      expect(result.id).toBe(mockUserRoleData.id);
    });

    it("should create user role without audit context", async () => {
      // Arrange
      const userRole = UserRole.create(mockUserRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: { create: vi.fn().mockResolvedValue(mockUserRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(userRole);

      // Assert
      expect(result).toBeInstanceOf(UserRole);
    });
  });

  describe("deleteByUserAndRole", () => {
    it("should delete user role and create audit log", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findUnique: vi.fn().mockResolvedValue(mockUserRoleData),
            update: vi
              .fn()
              .mockResolvedValue({ ...mockUserRoleData, isActive: false }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteByUserAndRole(
        mockUserRoleData.userId,
        mockUserRoleData.roleId,
        mockAuditContext,
      );

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false when user role not found", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
          audit: { create: vi.fn() },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteByUserAndRole("user-id", "role-id");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("deleteAllByUserId", () => {
    it("should delete all user roles and create audit logs", async () => {
      // Arrange
      const mockUserRoles = [mockUserRoleData];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findMany: vi.fn().mockResolvedValue(mockUserRoles),
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteAllByUserId(
        mockUserRoleData.userId,
        mockAuditContext,
      );

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it("should return 0 when user has no roles", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findMany: vi.fn().mockResolvedValue([]),
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          audit: { create: vi.fn() },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteAllByUserId("user-without-roles");

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("deleteAllByRoleId", () => {
    it("should delete all role assignments and create audit logs", async () => {
      // Arrange
      const mockUserRoles = [mockUserRoleData];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findMany: vi.fn().mockResolvedValue(mockUserRoles),
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteAllByRoleId(
        mockUserRoleData.roleId,
        mockAuditContext,
      );

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it("should return 0 when role has no users", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          userRole: {
            findMany: vi.fn().mockResolvedValue([]),
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          audit: { create: vi.fn() },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.deleteAllByRoleId("role-without-users");

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("userHasRole", () => {
    it("should return true when user has active role", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findUnique).mockResolvedValue(mockUserRoleData);

      // Act
      const result = await repository.userHasRole(
        mockUserRoleData.userId,
        mockUserRoleData.roleId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when user does not have role", async () => {
      // Arrange
      vi.mocked(prisma.userRole.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.userHasRole("user-id", "role-id");

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when user role is inactive", async () => {
      // Arrange
      const inactiveUserRole = { ...mockUserRoleData, isActive: false };
      vi.mocked(prisma.userRole.findUnique).mockResolvedValue(inactiveUserRole);

      // Act
      const result = await repository.userHasRole(
        mockUserRoleData.userId,
        mockUserRoleData.roleId,
      );

      // Assert
      expect(result).toBe(false);
    });
  });
});
