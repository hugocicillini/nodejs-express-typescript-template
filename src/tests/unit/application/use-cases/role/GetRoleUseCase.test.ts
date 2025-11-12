import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetRoleByIdUseCase,
  type GetRoleByIdInput,
} from "@/application/use-cases/role/GetRoleUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("GetRoleByIdUseCase", () => {
  let useCase: GetRoleByIdUseCase;
  let mockRoleRepository: IRoleRepository;

  const mockRole = Role.create({
    id: "role-123",
    name: RoleName.ADMIN,
    description: "Administrator role",
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

    useCase = new GetRoleByIdUseCase(mockRoleRepository);
  });

  describe("execute", () => {
    it("should return role when found", async () => {
      // Arrange
      const input: GetRoleByIdInput = {
        id: "role-123",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Role found");
      expect(result.responseObject?.id).toBe(mockRole.id);
      expect(result.responseObject?.name).toBe(RoleName.ADMIN);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(input.id);
    });

    it("should fail when role not found", async () => {
      // Arrange
      const input: GetRoleByIdInput = {
        id: "non-existent-id",
      };

      vi.mocked(mockRoleRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("Role not found");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: GetRoleByIdInput = {
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
      expect(result.message).toBe("An error occurred while finding role");
    });
  });
});
