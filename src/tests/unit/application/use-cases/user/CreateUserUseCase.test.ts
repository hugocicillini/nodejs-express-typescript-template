import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CreateUserUseCase,
  type CreateUserInput,
} from "@/application/use-cases/user/CreateUserUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import { StatusCodes } from "http-status-codes";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;

  const mockUserData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword123",
    isActive: true,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
    deletedAt: null,
  };

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

    useCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe("execute", () => {
    it("should create user successfully", async () => {
      // Arrange
      const input: CreateUserInput = {
        email: "newuser@example.com",
        name: "New User",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue("hashedPassword123");

      const createdUser = User.create(mockUserData);
      vi.mocked(mockUserRepository.create).mockResolvedValue(createdUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.message).toBe("User created successfully");
      expect(result.responseObject).toEqual(createdUser.toJSON());
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("should fail when email already exists", async () => {
      // Arrange
      const input: CreateUserInput = {
        email: "existing@example.com",
        name: "Existing User",
        password: "password123",
      };

      const existingUser = User.create(mockUserData);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("Email already in use");
      expect(result.responseObject).toBeNull();
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: CreateUserInput = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred while creating user");
    });

    it("should create user with audit context", async () => {
      // Arrange
      const input: CreateUserInput = {
        email: "newuser@example.com",
        name: "New User",
        password: "password123",
        auditContext: {
          performedByUserId: "admin-id",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue("hashedPassword123");

      const createdUser = User.create(mockUserData);
      vi.mocked(mockUserRepository.create).mockResolvedValue(createdUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.any(User),
        input.auditContext,
      );
    });
  });
});
