import {
  RefreshTokenUseCase,
  type RefreshTokenInput,
} from "@/application/use-cases/auth/RefreshTokenUseCase";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import { User } from "@/domain/entities/User";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("RefreshTokenUseCase", () => {
  let useCase: RefreshTokenUseCase;
  let mockUserRepository: IUserRepository;
  let mockRefreshTokenRepository: IRefreshTokenRepository;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockJwtService: IJwtService;

  const mockUser = User.create({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const mockRefreshToken = RefreshToken.create({
    id: "token-123",
    token: "refresh-token-string",
    userId: "user-123",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    mockJwtService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new RefreshTokenUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockUserRoleRepository,
      mockJwtService,
    );
  });

  describe("execute", () => {
    it("should refresh tokens successfully", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "refresh-token-string",
      };

      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue({
        sub: "user-123",
        tokenId: "token-123",
      });
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(
        mockRefreshToken,
      );
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRoleRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockRefreshTokenRepository.deleteByToken).mockResolvedValue();
      vi.mocked(mockJwtService.generateAccessToken).mockReturnValue(
        "new-access-token",
      );
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(
        "new-refresh-token",
      );
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue({} as any);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Token refreshed successfully");
      expect(result.responseObject?.accessToken).toBe("new-access-token");
      expect(result.responseObject?.refreshToken).toBe("new-refresh-token");
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        input.refreshToken,
      );
    });

    it("should fail when JWT token is invalid", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "invalid-token",
      };

      vi.mocked(mockJwtService.verifyRefreshToken).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.message).toBe("Invalid or expired refresh token");
    });

    it("should fail when token not found in database", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "refresh-token-string",
      };

      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue({
        sub: "user-123",
        tokenId: "token-123",
      });
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.message).toBe("Refresh token not found");
    });

    it("should fail when token is expired", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "refresh-token-string",
      };

      const expiredToken = RefreshToken.create({
        ...mockRefreshToken.toJSON(),
        expiresAt: new Date(Date.now() - 1000), // Expirado
      });

      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue({
        sub: "user-123",
        tokenId: "token-123",
      });
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(
        expiredToken,
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.message).toBe("Refresh token expired");
    });

    it("should fail when user not found or inactive", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "refresh-token-string",
      };

      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue({
        sub: "user-123",
        tokenId: "token-123",
      });
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(
        mockRefreshToken,
      );
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.message).toBe("User not found or inactive");
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      const input: RefreshTokenInput = {
        refreshToken: "refresh-token-string",
      };

      vi.mocked(mockJwtService.verifyRefreshToken).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
