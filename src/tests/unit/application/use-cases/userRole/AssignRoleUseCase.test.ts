import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AssignRoleUseCase,
  type AssignRoleInput,
} from "@/application/use-cases/userRole/AssignRoleUseCase";
import { UserRole } from "@/domain/entities/UserRole";
import { User } from "@/domain/entities/User";
import { Role } from "@/domain/entities/Role";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("AssignRoleUseCase", () => {
  let useCase: AssignRoleUseCase;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockUserRepository: IUserRepository;
  let mockRoleRepository: IRoleRepository;

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

    useCase = new AssignRoleUseCase(
      mockUserRoleRepository,
      mockUserRepository,
      mockRoleRepository,
    );
  });

  describe("execute", () => {
    it("should assign role to user successfully", async () => {
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      const mockUser = User.create({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRole = Role.create({
        id: "role-123",
        name: "ADMIN",
        description: "Admin role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

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

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.message).toBe("Role assigned to user successfully");
      expect(mockUserRepository.findById).toHaveBeenCalledWith(input.userId);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(input.roleId);
      expect(mockUserRoleRepository.create).toHaveBeenCalled();
    });

    it("should fail when user not found", async () => {
      const input: AssignRoleInput = {
        userId: "non-existent-user",
        roleId: "role-123",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User not found");
    });

    it("should fail when role not found", async () => {
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "non-existent-role",
      };

      const mockUser = User.create({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRoleRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("Role not found");
    });

    it("should fail when user already has the role", async () => {
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      const mockUser = User.create({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRole = Role.create({
        id: "role-123",
        name: "ADMIN",
        description: "Admin role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const existingUserRole = UserRole.create({
        id: "existing-ur-123",
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

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("User already has this role");
    });

    it("should assign role with expiration date", async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
        expiresAt: futureDate,
      };

      const mockUser = User.create({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRole = Role.create({
        id: "role-123",
        name: "ADMIN",
        description: "Admin role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

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

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.responseObject?.expiresAt).toBeDefined();
    });

    it("should handle repository errors", async () => {
      const input: AssignRoleInput = {
        userId: "user-123",
        roleId: "role-123",
      };

      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while assigning role");
    });
  });
});
