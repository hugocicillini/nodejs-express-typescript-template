import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllRolesUseCase } from "@/application/use-cases/role/ListRolesUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("GetAllRolesUseCase", () => {
  let useCase: GetAllRolesUseCase;
  let mockRoleRepository: IRoleRepository;

  beforeEach(() => {
    mockRoleRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GetAllRolesUseCase(mockRoleRepository);
  });

  describe("execute", () => {
    it("should return all roles successfully", async () => {
      // Arrange
      const mockRoles = [
        Role.create({
          id: "1",
          name: RoleName.ADMIN,
          description: "Admin role",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
        Role.create({
          id: "2",
          name: RoleName.USER,
          description: "User role",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      vi.mocked(mockRoleRepository.findAll).mockResolvedValue(mockRoles);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Roles found");
      expect(result.responseObject).toHaveLength(2);
    });

    it("should fail when no roles found", async () => {
      // Arrange
      vi.mocked(mockRoleRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No roles found");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      vi.mocked(mockRoleRepository.findAll).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while retrieving roles");
    });
  });
});
