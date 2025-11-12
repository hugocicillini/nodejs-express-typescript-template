import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  UpdateUserUseCase,
  type UpdateUserInput,
} from "@/application/use-cases/user/UpdateUserUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import { StatusCodes } from "http-status-codes";

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;

  const mockUser = User.create({
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword",
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

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    useCase = new UpdateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe("execute", () => {
    it("should update user name successfully", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: mockUser.id,
        name: "Updated Name",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("User updated successfully");
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("should update user password successfully", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: mockUser.id,
        password: "newPassword123",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue("newHashedPassword");
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("should update both name and password", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: mockUser.id,
        name: "New Name",
        password: "newPassword123",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue("newHashedPassword");
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPasswordHasher.hash).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("should fail when user not found", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: "non-existent-id",
        name: "New Name",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User not found");
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should update with audit context", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: mockUser.id,
        name: "Updated Name",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.any(User),
        input.auditContext,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: UpdateUserInput = {
        id: mockUser.id,
        name: "New Name",
      };

      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while updating user");
    });
  });
});
