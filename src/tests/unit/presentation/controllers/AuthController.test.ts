import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { AuthController } from "@/presentation/controllers/AuthController";
import type { RegisterUseCase } from "@/application/use-cases/auth/RegisterUseCase";
import type { LoginUseCase } from "@/application/use-cases/auth/LoginUseCase";
import type { RefreshTokenUseCase } from "@/application/use-cases/auth/RefreshTokenUseCase";
import type { LogoutUseCase } from "@/application/use-cases/auth/LogoutUseCase";

describe("AuthController", () => {
  let authController: AuthController;
  let mockRegisterUseCase: RegisterUseCase;
  let mockLoginUseCase: LoginUseCase;
  let mockRefreshTokenUseCase: RefreshTokenUseCase;
  let mockLogoutUseCase: LogoutUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRegisterUseCase = {
      execute: vi.fn(),
    } as any;

    mockLoginUseCase = {
      execute: vi.fn(),
    } as any;

    mockRefreshTokenUseCase = {
      execute: vi.fn(),
    } as any;

    mockLogoutUseCase = {
      execute: vi.fn(),
    } as any;

    authController = new AuthController(
      mockRegisterUseCase,
      mockLoginUseCase,
      mockRefreshTokenUseCase,
      mockLogoutUseCase,
    );

    mockRequest = {
      body: {},
      headers: {},
      ip: "127.0.0.1",
      user: undefined,
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("register", () => {
    it("should call RegisterUseCase with correct parameters", async () => {
      mockRequest.body = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "User registered successfully",
        responseObject: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        statusCode: 201,
      } as any;

      vi.mocked(mockRegisterUseCase.execute).mockResolvedValue(mockResult);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        auditContext: {
          performedByUserId: null,
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle registration failure", async () => {
      mockRequest.body = {
        email: "existing@example.com",
        name: "Test User",
        password: "password123",
      };

      const mockResult = {
        success: false,
        message: "Email already exists",
        responseObject: null,
        statusCode: 409,
      } as any;

      vi.mocked(mockRegisterUseCase.execute).mockResolvedValue(mockResult);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("login", () => {
    it("should call LoginUseCase with correct parameters", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResult = {
        success: true,
        message: "Login successful",
        responseObject: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          user: {
            id: "user-123",
            email: "test@example.com",
            name: "Test User",
          },
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockLoginUseCase.execute).mockResolvedValue(mockResult);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle login failure", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "wrong-password",
      };

      const mockResult = {
        success: false,
        message: "Invalid credentials",
        responseObject: null,
        statusCode: 401,
      } as any;

      vi.mocked(mockLoginUseCase.execute).mockResolvedValue(mockResult);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("refreshToken", () => {
    it("should call RefreshTokenUseCase with correct parameters", async () => {
      mockRequest.body = {
        refreshToken: "valid-refresh-token",
      };

      const mockResult = {
        success: true,
        message: "Token refreshed successfully",
        responseObject: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockRefreshTokenUseCase.execute).mockResolvedValue(mockResult);

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith({
        refreshToken: "valid-refresh-token",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle invalid refresh token", async () => {
      mockRequest.body = {
        refreshToken: "invalid-token",
      };

      const mockResult = {
        success: false,
        message: "Invalid refresh token",
        responseObject: null,
        statusCode: 401,
      } as any;

      vi.mocked(mockRefreshTokenUseCase.execute).mockResolvedValue(mockResult);

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("logout", () => {
    it("should call LogoutUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "user-123" };
      mockRequest.body = {
        refreshToken: "refresh-token",
      };

      const mockResult = {
        success: true,
        statusCode: 200,
        message: "Logged out successfully",
      } as any;

      vi.mocked(mockLogoutUseCase.execute).mockResolvedValue(mockResult);

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({
        userId: "user-123",
        refreshToken: "refresh-token",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle logout without user", async () => {
      mockRequest.body = {
        refreshToken: "refresh-token",
      };

      const mockResult = {
        success: true,
        message: "Logged out successfully",
        responseObject: null,
        statusCode: 200,
      } as any;

      vi.mocked(mockLogoutUseCase.execute).mockResolvedValue(mockResult);

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({
        userId: undefined,
        refreshToken: "refresh-token",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
