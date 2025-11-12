import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CreateRoleUseCase,
  type CreateRoleInput,
} from "@/application/use-cases/role/CreateRoleUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { StatusCodes } from "http-status-codes";

describe("CreateRoleUseCase", () => {
  let useCase: CreateRoleUseCase;
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

    useCase = new CreateRoleUseCase(mockRoleRepository);
  });

  describe("execute", () => {
    it("should create role successfully", async () => {
      // Arrange
      const input: CreateRoleInput = {
        name: RoleName.ADMIN,
        description: "Administrator role",
      };

      const mockRole = Role.create({
        id: "123",
        name: RoleName.ADMIN,
        description: "Administrator role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockRoleRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRoleRepository.create).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.message).toBe("Role created successfully");
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(input.name);
      expect(mockRoleRepository.create).toHaveBeenCalled();
    });

    it("should fail when role name already exists", async () => {
      // Arrange
      const input: CreateRoleInput = {
        name: RoleName.ADMIN,
        description: "Administrator role",
      };

      const existingRole = Role.create({
        id: "123",
        name: RoleName.ADMIN,
        description: "Existing role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockRoleRepository.findByName).mockResolvedValue(existingRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("Role name already in use");
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it("should create role with audit context", async () => {
      // Arrange
      const input: CreateRoleInput = {
        name: RoleName.USER,
        description: "User role",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      const mockRole = Role.create({
        id: "123",
        name: RoleName.USER,
        description: "User role",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockRoleRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRoleRepository.create).mockResolvedValue(mockRole);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        expect.any(Role),
        input.auditContext,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: CreateRoleInput = {
        name: RoleName.ADMIN,
        description: "Admin role",
      };

      vi.mocked(mockRoleRepository.findByName).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while creating role");
    });
  });
});
