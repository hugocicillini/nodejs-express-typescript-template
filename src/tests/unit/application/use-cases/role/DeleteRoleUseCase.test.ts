import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DeleteRoleUseCase,
  type DeleteRoleInput,
} from "@/application/use-cases/role/DeleteRoleUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("DeleteRoleUseCase", () => {
  let useCase: DeleteRoleUseCase;
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

    useCase = new DeleteRoleUseCase(mockRoleRepository);
  });

  describe("execute", () => {
    it("should delete role successfully", async () => {
      // Arrange
      const input: DeleteRoleInput = {
        id: "role-123",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.delete).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Role deleted successfully");
      expect(result.responseObject?.success).toBe(true);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(
        input.id,
        undefined,
      );
    });

    it("should fail when role not found", async () => {
      // Arrange
      const input: DeleteRoleInput = {
        id: "non-existent-id",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("Role not found or already deleted");
      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it("should delete with audit context", async () => {
      // Arrange
      const input: DeleteRoleInput = {
        id: "role-123",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockRoleRepository.delete).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(
        input.id,
        input.auditContext,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: DeleteRoleInput = {
        id: "role-123",
      };

      vi.mocked(mockRoleRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while deleting role");
    });
  });
});
