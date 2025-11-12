import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  UpdateRoleUseCase,
  type UpdateRoleInput,
} from "@/application/use-cases/role/UpdateRoleUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("UpdateRoleUseCase", () => {
  let useCase: UpdateRoleUseCase;
  let mockRoleRepository: IRoleRepository;

  const mockRole = Role.create({
    id: "role-123",
    name: RoleName.USER,
    description: "User role",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(() => {
    mockRoleRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new UpdateRoleUseCase(mockRoleRepository);
  });

  describe("execute", () => {
    it("should update role description successfully", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "role-123",
        description: "Updated description",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.update).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Role updated successfully");
      expect(mockRoleRepository.update).toHaveBeenCalled();
    });

    it("should update role name successfully", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "role-123",
        name: RoleName.ADMIN,
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRoleRepository.update).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(input.name);
      expect(mockRoleRepository.update).toHaveBeenCalled();
    });

    it("should update role isActive status", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "role-123",
        isActive: false,
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.update).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRoleRepository.update).toHaveBeenCalled();
    });

    it("should fail when role not found", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "non-existent-id",
        description: "New description",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("Role not found");
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it("should fail when new name already exists", async () => {
      // Arrange
      const mockRoleDifferent = Role.create({
        id: "role-456",
        name: RoleName.USER,
        description: "User role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const input: UpdateRoleInput = {
        id: "role-456",
        name: RoleName.ADMIN,
      };

      const existingRole = Role.create({
        id: "other-role-id",
        name: RoleName.ADMIN,
        description: "Admin role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(
        mockRoleDifferent,
      );
      vi.mocked(mockRoleRepository.findByName).mockResolvedValue(existingRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("A role with this name already exists");
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it("should update with audit context", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "role-123",
        description: "Updated description",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.update).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        expect.any(Role),
        input.auditContext,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: UpdateRoleInput = {
        id: "role-123",
        description: "New description",
      };

      vi.mocked(mockRoleRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while updating role");
    });
  });
});
