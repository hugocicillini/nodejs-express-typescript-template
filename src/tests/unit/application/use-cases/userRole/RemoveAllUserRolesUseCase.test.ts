import {
  RemoveAllUserRolesUseCase,
  type RemoveAllUserRolesInput,
} from "@/application/use-cases/userRole/RemoveAllUserRolesUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("RemoveAllUserRolesUseCase", () => {
  let useCase: RemoveAllUserRolesUseCase;
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

    useCase = new RemoveAllUserRolesUseCase(mockUserRoleRepository);
  });

  describe("execute", () => {
    it("should remove all roles from user successfully", async () => {
      // Arrange
      const input: RemoveAllUserRolesInput = {
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
      vi.mocked(mockUserRoleRepository.deleteAllByUserId).mockResolvedValue(2);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("All roles removed from user successfully");
      expect(result.responseObject?.count).toBe(2);
      expect(mockUserRoleRepository.deleteAllByUserId).toHaveBeenCalledWith(
        input.userId,
        expect.objectContaining({
          payload: expect.objectContaining({
            userId: input.userId,
            action: "ALL_ROLES_REMOVED",
          }),
        }),
      );
    });

    it("should handle user with no roles", async () => {
      // Arrange
      const input: RemoveAllUserRolesInput = {
        userId: "user-without-roles",
      };

      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No roles found for this user");
      expect(result.responseObject?.count).toBe(0);
      expect(mockUserRoleRepository.deleteAllByUserId).not.toHaveBeenCalled();
    });

    it("should remove roles with audit context", async () => {
      // Arrange
      const input: RemoveAllUserRolesInput = {
        userId: "user-123",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
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
      ];

      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue(
        mockUserRoles,
      );
      vi.mocked(mockUserRoleRepository.deleteAllByUserId).mockResolvedValue(1);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUserRoleRepository.deleteAllByUserId).toHaveBeenCalledWith(
        input.userId,
        expect.objectContaining({
          performedByUserId: "admin-id",
        }),
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: RemoveAllUserRolesInput = {
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
      expect(result.message).toBe("An error occurred while removing all roles");
    });
  });
});
