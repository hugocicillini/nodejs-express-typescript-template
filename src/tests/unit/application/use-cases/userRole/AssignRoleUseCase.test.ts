import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AssignRoleUseCase,
  type AssignRoleInput,
} from "@/application/use-cases/userRole/AssignRoleUseCase";
import { User } from "@/domain/entities/User";
import { Role } from "@/domain/entities/Role";
import { UserRole } from "@/domain/entities/UserRole";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("AssignRoleUseCase", () => {
  let useCase: AssignRoleUseCase;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockUserRepository: IUserRepository;
  let mockRoleRepository: IRoleRepository;

  const mockUser = User.create({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    password: "hash",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const mockRole = Role.create({
    id: "role-123",
    name: RoleName.ADMIN,
    description: "Admin role",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(() => {
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockRoleRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

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

    useCase = new AssignRoleUseCase(
      mockUserRoleRepository,
      mockUserRepository,
      mockRoleRepository,
    );
  });

  describe("execute", () => {
    it("should assign role to user successfully", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      const mockUserRole = UserRole.create({
        id: "ur-123",
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: null,
        expiresAt: null,
        isActive: true,
      });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        null,
      );
      vi.mocked(mockUserRoleRepository.create).mockResolvedValue(mockUserRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.message).toBe("Role assigned to user successfully");
      expect(mockUserRoleRepository.create).toHaveBeenCalled();
    });

    it("should fail when user not found", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "non-existent-user",
        roleId: "role-123",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User not found");
      expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
    });

    it("should fail when role not found", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "non-existent-role",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRoleRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("Role not found");
      expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
    });

    it("should fail when user already has the role", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      const existingUserRole = UserRole.create({
        id: "ur-123",
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: null,
        expiresAt: null,
        isActive: true,
      });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        existingUserRole,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("User already has this role");
      expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
    });

    it("should assign role with expiration date", async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
        expiresAt: futureDate,
      };

      const mockUserRole = UserRole.create({
        id: "ur-123",
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: null,
        expiresAt: futureDate,
        isActive: true,
      });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRoleRepository.findById).mockResolvedValue(mockRole);
      vi.mocked(mockUserRoleRepository.findByUserAndRole).mockResolvedValue(
        null,
      );
      vi.mocked(mockUserRoleRepository.create).mockResolvedValue(mockUserRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.responseObject?.expiresAt).toBeDefined();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while assigning role");
    });
  });
});
