import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllUsersUseCase } from "@/application/use-cases/user/GetAllUsersUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { StatusCodes } from "http-status-codes";

describe("GetAllUsersUseCase", () => {
  let useCase: GetAllUsersUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GetAllUsersUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should return all users successfully", async () => {
      // Arrange
      const mockUsers = [
        User.create({
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          password: "hash1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
        User.create({
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          password: "hash2",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Users found");
      expect(result.responseObject).toHaveLength(2);
    });

    it("should fail when no users found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.message).toBe("No users found");
      expect(result.responseObject).toBeNull();
    });

    it("should handle repository errors", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findAll).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while retrieving users");
    });
  });
});
