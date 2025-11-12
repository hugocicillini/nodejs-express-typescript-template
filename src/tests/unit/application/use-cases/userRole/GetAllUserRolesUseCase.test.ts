import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllUserRolesUseCase } from "@/application/use-cases/userRole/GetAllUserRolesUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("GetAllUserRolesUseCase", () => {
  let useCase: GetAllUserRolesUseCase;
  let mockUserRoleRepository: IUserRoleRepository;

  beforeEach(() => {
    mockUserRoleRepository = {
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findByRoleId: vi.fn(),
      findByUserAndRole: vi.fn(),
      create: vi.fn(),
      deleteByUserAndRole: vi.fn(),
      deleteAllByUserId: vi.fn(),
      deleteAllByRoleId: vi.fn(),
      userHasRole: vi.fn(),
    };

    useCase = new GetAllUserRolesUseCase(mockUserRoleRepository);
  });

  describe("execute", () => {
    it("should return all user roles successfully", async () => {
      // Arrange
      const mockUserRoles = [
        UserRole.create({
          id: "ur-1",
          userId: "user-1",
          roleId: "role-1",
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
        UserRole.create({
          id: "ur-2",
          userId: "user-2",
          roleId: "role-2",
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
      ];

      vi.mocked(mockUserRoleRepository.findAll).mockResolvedValue(
        mockUserRoles,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("User roles found");
      expect(result.responseObject).toHaveLength(2);
    });

    it("should fail when no user roles found", async () => {
      // Arrange
      vi.mocked(mockUserRoleRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No user roles found");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      vi.mocked(mockUserRoleRepository.findAll).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(
        "An error occurred while retrieving user roles",
      );
    });
  });
});
