import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaRoleRepository } from "@/infrastructure/repositories/PrismaRoleRepository";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import { prisma } from "@/infrastructure/database/prisma";
import type { AuditContext } from "@/shared/types/auditContext";

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    role: {
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

describe("PrismaRoleRepository", () => {
  let repository: PrismaRoleRepository;

  const mockRoleData = {
    id: "660e8400-e29b-41d4-a716-446655440000",
    name: RoleName.ADMIN,
    description: "Administrator role",
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
    repository = new PrismaRoleRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findAll", () => {
    it("should return all active roles", async () => {
      // Arrange
      const mockRoles = [mockRoleData];
      vi.mocked(prisma.role.findMany).mockResolvedValue(mockRoles);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          deletedAt: null,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Role);
      expect(result[0]?.name).toBe(mockRoleData.name);
    });

    it("should return empty array when no roles found", async () => {
      // Arrange
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return role when found", async () => {
      // Arrange
      vi.mocked(prisma.role.findFirst).mockResolvedValue(mockRoleData);

      // Act
      const result = await repository.findById(mockRoleData.id);

      // Assert
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { id: mockRoleData.id, isActive: true, deletedAt: null },
      });
      expect(result).toBeInstanceOf(Role);
      expect(result?.id).toBe(mockRoleData.id);
    });

    it("should return null when role not found", async () => {
      // Arrange
      vi.mocked(prisma.role.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should return role when found by name", async () => {
      // Arrange
      vi.mocked(prisma.role.findFirst).mockResolvedValue(mockRoleData);

      // Act
      const result = await repository.findByName(RoleName.ADMIN);

      // Assert
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { name: RoleName.ADMIN, isActive: true, deletedAt: null },
      });
      expect(result).toBeInstanceOf(Role);
      expect(result?.name).toBe(RoleName.ADMIN);
    });

    it("should return null when role not found by name", async () => {
      // Arrange
      vi.mocked(prisma.role.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.findByName(RoleName.USER);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create role and audit log", async () => {
      // Arrange
      const role = Role.create(mockRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: { create: vi.fn().mockResolvedValue(mockRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(role, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Role);
      expect(result.id).toBe(mockRoleData.id);
    });

    it("should create role without audit context", async () => {
      // Arrange
      const role = Role.create(mockRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: { create: vi.fn().mockResolvedValue(mockRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.create(role);

      // Assert
      expect(result).toBeInstanceOf(Role);
    });
  });

  describe("update", () => {
    it("should update role and create audit log", async () => {
      // Arrange
      const role = Role.create(mockRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: { update: vi.fn().mockResolvedValue(mockRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.update(role, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Role);
      expect(result.id).toBe(mockRoleData.id);
    });

    it("should update role without audit context", async () => {
      // Arrange
      const role = Role.create(mockRoleData);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: { update: vi.fn().mockResolvedValue(mockRoleData) },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      const result = await repository.update(role);

      // Assert
      expect(result).toBeInstanceOf(Role);
    });
  });

  describe("delete", () => {
    it("should soft delete role and create audit log", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: {
            update: vi.fn().mockResolvedValue({
              ...mockRoleData,
              isActive: false,
              deletedAt: new Date(),
            }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      await repository.delete(mockRoleData.id, mockAuditContext);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should soft delete role without audit context", async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          role: {
            update: vi.fn().mockResolvedValue({
              ...mockRoleData,
              isActive: false,
              deletedAt: new Date(),
            }),
          },
          audit: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx as any);
      });

      // Act
      await repository.delete(mockRoleData.id);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
