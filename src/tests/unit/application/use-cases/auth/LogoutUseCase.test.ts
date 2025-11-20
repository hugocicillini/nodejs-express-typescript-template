import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  LogoutUseCase,
  type LogoutInput,
} from "@/application/use-cases/auth/LogoutUseCase";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import { StatusCodes } from "http-status-codes";

describe("LogoutUseCase", () => {
  let useCase: LogoutUseCase;
  let mockRefreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    mockRefreshTokenRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      findByUserId: vi.fn(),
      deleteByToken: vi.fn(),
      deleteAllByUserId: vi.fn(),
    };

    useCase = new LogoutUseCase(mockRefreshTokenRepository);
  });

  describe("execute", () => {
    it("should logout and delete specific refresh token", async () => {
      // Arrange
      const input: LogoutInput = {
        userId: "user-123",
        refreshToken: "refresh-token-abc",
      };

      vi.mocked(mockRefreshTokenRepository.deleteByToken).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Logout successful");
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        input.refreshToken,
        input.auditContext,
      );
      expect(
        mockRefreshTokenRepository.deleteAllByUserId,
      ).not.toHaveBeenCalled();
    });

    it("should logout and delete all user tokens when no specific token provided", async () => {
      // Arrange
      const input: LogoutInput = {
        userId: "user-123",
      };

      vi.mocked(
        mockRefreshTokenRepository.deleteAllByUserId,
      ).mockResolvedValue();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.message).toBe("Logout successful");
      expect(mockRefreshTokenRepository.deleteAllByUserId).toHaveBeenCalledWith(
        input.userId,
        input.auditContext,
      );
      expect(mockRefreshTokenRepository.deleteByToken).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      // Arrange
      const input: LogoutInput = {
        userId: "user-123",
        refreshToken: "token-123",
      };

      vi.mocked(mockRefreshTokenRepository.deleteByToken).mockRejectedValue(
        new Error("Database error"),
      );

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("An error occurred during logout");
    });
  });
});
