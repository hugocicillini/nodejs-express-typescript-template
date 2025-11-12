import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  LoginUseCase,
  type LoginInput,
} from "@/application/use-cases/auth/LoginUseCase";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import { StatusCodes } from "http-status-codes";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let mockUserRepository: IUserRepository;
  let mockRefreshTokenRepository: IRefreshTokenRepository;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockPasswordHasher: IPasswordHasher;
  let mockJwtService: IJwtService;

  const mockUser = User.create({
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
    name: "Test User",
    password: "$2a$10$hashedPassword",
    isActive: true,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
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

    useCase = new LoginUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockUserRoleRepository,
      mockPasswordHasher,
      mockJwtService,
    );
  });

  describe("execute", () => {
    it("should login successfully with valid credentials", async () => {
      // Arrange
      const input: LoginInput = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);
      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockJwtService.generateAccessToken).mockReturnValue(
        "access-token-123",
      );
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(
        "refresh-token-123",
      );
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue({} as any);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Login successful");
      expect(result.responseObject).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        accessToken: "access-token-123",
        refreshToken: "refresh-token-123",
      });
    });

    it("should fail when user not found", async () => {
      // Arrange
      const input: LoginInput = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    });

    it("should fail when password is invalid", async () => {
      // Arrange
      const input: LoginInput = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.message).toBe("Invalid credentials");
      expect(mockJwtService.generateAccessToken).not.toHaveBeenCalled();
    });

    it("should fail when user is inactive", async () => {
      // Arrange
      const inactiveUser = User.create({
        ...mockUser.toJSON(),
        password: mockUser.password,
        isActive: false,
      });

      const input: LoginInput = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(inactiveUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(result.message).toBe("User account is inactive");
      expect(mockJwtService.generateAccessToken).not.toHaveBeenCalled();
    });

    it("should create refresh token on successful login", async () => {
      // Arrange
      const input: LoginInput = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);
      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockJwtService.generateAccessToken).mockReturnValue(
        "access-token",
      );
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(
        "refresh-token",
      );
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue({} as any);

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          token: "refresh-token",
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      const input: LoginInput = {
        email: "test@example.com",
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
      expect(result.message).toBe("An error occurred during login");
    });
  });
});
