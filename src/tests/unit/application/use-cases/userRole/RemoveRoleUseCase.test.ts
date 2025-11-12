import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  RemoveRoleUseCase,
  type RemoveRoleInput,
} from "@/application/use-cases/userRole/RemoveRoleUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("RemoveRoleUseCase", () => {
  let useCase: RemoveRoleUseCase;
  let mockUserRoleRepository: IUserRoleRepository;

  const mockUserRole = UserRole.create({
    id: "ur-123",
    userId: "user-123",
    roleId: "role-123",
    assignedAt: new Date(),
    assignedBy: null,
    expiresAt: null,
    isActive: true,
  });

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

    useCase = new RemoveRoleUseCase(mockUserRoleRepository);
  });

  describe("execute", () => {
    it("should remove role from user successfully", async () => {
      // Arrange
      const input: RemoveRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        mockUserRole,
      );
      vi.mocked(mockUserRoleRepository.deleteByUserAndRole).mockResolvedValue(
        true,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Role removed from user successfully");
      expect(result.responseObject?.success).toBe(true);
      expect(mockUserRoleRepository.deleteByUserAndRole).toHaveBeenCalledWith(
        input.userId,
        input.roleId,
        expect.objectContaining({
          payload: expect.objectContaining({
            userId: input.userId,
            roleId: input.roleId,
            action: "ROLE_REMOVED",
          }),
        }),
      );
    });

    it("should fail when user role assignment not found", async () => {
      // Arrange
      const input: RemoveRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        null,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User role assignment not found");
      expect(mockUserRoleRepository.deleteByUserAndRole).not.toHaveBeenCalled();
    });

    it("should fail when deletion fails", async () => {
      // Arrange
      const input: RemoveRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        mockUserRole,
      );
      vi.mocked(mockUserRoleRepository.deleteByUserAndRole).mockResolvedValue(
        false,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Failed to remove role from user");
    });

    it("should remove role with audit context", async () => {
      // Arrange
      const input: RemoveRoleInput = {
        userId: "user-123",
        roleId: "role-123",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        mockUserRole,
      );
      vi.mocked(mockUserRoleRepository.deleteByUserAndRole).mockResolvedValue(
        true,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUserRoleRepository.deleteByUserAndRole).toHaveBeenCalledWith(
        input.userId,
        input.roleId,
        expect.objectContaining({
          performedByUserId: "admin-id",
        }),
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: RemoveRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while removing role");
    });
  });
});
