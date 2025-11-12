import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetUserRolesUseCase,
  type GetUserRolesInput,
} from "@/application/use-cases/userRole/GetUserRolesUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("GetUserRolesUseCase", () => {
  let useCase: GetUserRolesUseCase;
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

    useCase = new GetUserRolesUseCase(mockUserRoleRepository);
  });

  describe("execute", () => {
    it("should return user roles successfully", async () => {
      // Arrange
      const input: GetUserRolesInput = {
        userId: "user-123",
      };

      const mockUserRoles = [
        UserRole.create({
          id: "ur-1",
          userId: input.userId,
          roleId: "role-1",
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
        UserRole.create({
          id: "ur-2",
          userId: input.userId,
          roleId: "role-2",
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
      ];

      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue(
        mockUserRoles,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("User roles found");
      expect(result.responseObject).toHaveLength(2);
      expect(mockUserRoleRepository.findByUserId).toHaveBeenCalledWith(
        input.userId,
      );
    });

    it("should fail when user has no roles", async () => {
      // Arrange
      const input: GetUserRolesInput = {
        userId: "user-without-roles",
      };

      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No roles found for this user");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: GetUserRolesInput = {
        userId: "user-123",
      };

      vi.mocked(mockUserRoleRepository.findByUserId).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(
        "An error occurred while retrieving user roles",
      );
    });
  });
});
