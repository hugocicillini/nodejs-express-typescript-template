import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetUsersByRoleUseCase,
  type GetUsersByRoleInput,
} from "@/application/use-cases/userRole/GetUsersByRoleUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("GetUsersByRoleUseCase", () => {
  let useCase: GetUsersByRoleUseCase;
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

    useCase = new GetUsersByRoleUseCase(mockUserRoleRepository);
  });

  describe("execute", () => {
    it("should return users with role successfully", async () => {
      // Arrange
      const input: GetUsersByRoleInput = {
        roleId: "role-123",
      };

      const mockUserRoles = [
        UserRole.create({
          id: "ur-1",
          userId: "user-1",
          roleId: input.roleId,
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
        UserRole.create({
          id: "ur-2",
          userId: "user-2",
          roleId: input.roleId,
          assignedAt: new Date(),
          assignedBy: null,
          expiresAt: null,
          isActive: true,
        }),
      ];

      vi.mocked(mockUserRoleRepository.findByRoleId).mockResolvedValue(
        mockUserRoles,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Users with role found");
      expect(result.responseObject).toHaveLength(2);
      expect(mockUserRoleRepository.findByRoleId).toHaveBeenCalledWith(
        input.roleId,
      );
    });

    it("should fail when no users found with role", async () => {
      // Arrange
      const input: GetUsersByRoleInput = {
        roleId: "role-without-users",
      };

      vi.mocked(mockUserRoleRepository.findByRoleId).mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No users found with this role");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: GetUsersByRoleInput = {
        roleId: "role-123",
      };

      vi.mocked(mockUserRoleRepository.findByRoleId).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(
        "An error occurred while retrieving users with role",
      );
    });
  });
});
