import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetUserByIdUseCase,
  type GetUserByIdInput,
} from "@/application/use-cases/user/GetUserByIdUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { StatusCodes } from "http-status-codes";

describe("GetUserByIdUseCase", () => {
  let useCase: GetUserByIdUseCase;
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

    useCase = new GetUserByIdUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should return user when found", async () => {
      // Arrange
      const input: GetUserByIdInput = { id: mockUser.id };
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("User found");
      expect(result.responseObject?.id).toBe(mockUser.id);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(input.id);
    });

    it("should fail when user not found", async () => {
      // Arrange
      const input: GetUserByIdInput = { id: "non-existent-id" };
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("User not found");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: GetUserByIdInput = { id: "some-id" };
      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while finding user");
    });
  });
});
