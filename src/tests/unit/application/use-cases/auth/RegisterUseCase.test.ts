import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  RegisterUseCase,
  type RegisterInput,
} from "@/application/use-cases/auth/RegisterUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import { StatusCodes } from "http-status-codes";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let mockUserRepository: IUserRepository;
  let mockRefreshTokenRepository: IRefreshTokenRepository;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockPasswordHasher: IPasswordHasher;
  let mockJwtService: IJwtService;

  beforeEach(() => {
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockRefreshTokenRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      findByUserId: vi.fn(),
      deleteByToken: vi.fn(),
      deleteAllByUserId: vi.fn(),
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

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockJwtService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new RegisterUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockUserRoleRepository,
      mockPasswordHasher,
      mockJwtService,
    );
  });

  describe("execute", () => {
    it("should register user successfully", async () => {
      // Arrange
      const input: RegisterInput = {
        email: "newuser@example.com",
        name: "New User",
        password: "password123",
      };

      const mockUser = User.create({
        id: "123",
        email: input.email,
        name: input.name,
        password: "hashedPassword",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue("hashedPassword");
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockJwtService.generateAccessToken).mockReturnValue(
        "access-token",
      );
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(
        "refresh-token",
      );
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue({} as any);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.message).toBe("User registered successfully");
      expect(result.responseObject?.user).toBeDefined();
      expect(result.responseObject?.accessToken).toBe("access-token");
      expect(result.responseObject?.refreshToken).toBe("refresh-token");
    });

    it("should fail when email already exists", async () => {
      // Arrange
      const input: RegisterInput = {
        email: "existing@example.com",
        name: "Existing User",
        password: "password123",
      };

      const existingUser = User.create({
        id: "123",
        email: input.email,
        name: input.name,
        password: "hash",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.message).toBe("Email already in use");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: RegisterInput = {
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
      expect(result.message).toBe("An error occurred while registering user");
    });
  });
});
