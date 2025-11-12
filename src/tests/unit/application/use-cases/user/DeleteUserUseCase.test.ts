import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DeleteUserUseCase,
  type DeleteUserInput,
} from "@/application/use-cases/user/DeleteUserUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { StatusCodes } from "http-status-codes";

describe("DeleteUserUseCase", () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: IUserRepository;

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

    useCase = new DeleteUserUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should delete user successfully", async () => {
      // Arrange
      const input: DeleteUserInput = { id: mockUser.id };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.delete).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("User deleted successfully");
      expect(mockUserRepository.delete).toHaveBeenCalledWith(
        input.id,
        undefined,
      );
    });

    it("should fail when user not found", async () => {
      // Arrange
      const input: DeleteUserInput = { id: "non-existent-id" };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User not found or already deleted");
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it("should delete with audit context", async () => {
      // Arrange
      const input: DeleteUserInput = {
        id: mockUser.id,
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.delete).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(
        input.id,
        input.auditContext,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: DeleteUserInput = { id: mockUser.id };

      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while deleting user");
    });
  });
});
