import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  requireAuth,
  requireRole,
  optionalAuth,
} from "@/presentation/middlewares/authMiddleware";
import * as jwt from "@/shared/utils/jwt";

vi.mock("@/shared/utils/jwt");

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  describe("requireAuth", () => {
    it("should reject request without authorization header", () => {
      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Access token not provided",
        statusCode: 401,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should reject request with invalid authorization format", () => {
      mockRequest.headers = { authorization: "InvalidFormat token" };

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Access token not provided",
        statusCode: 401,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      vi.mocked(jwt.verifyAccessToken).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token",
        statusCode: 401,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should accept request with valid token", () => {
      const mockPayload = {
        sub: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["USER"],
      };

      mockRequest.headers = { authorization: "Bearer valid-token" };
      vi.mocked(jwt.verifyAccessToken).mockReturnValue(mockPayload);

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["USER"],
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("should reject request without user", () => {
      const middleware = requireRole(["ADMIN"]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication required",
        statusCode: 401,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should reject request when user lacks required role", () => {
      mockRequest.user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["USER"],
      };

      const middleware = requireRole(["ADMIN"]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Insufficient permissions",
        requiredRoles: ["ADMIN"],
        userRoles: ["USER"],
        statusCode: 403,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should accept request when user has required role", () => {
      mockRequest.user = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin User",
        roles: ["ADMIN", "USER"],
      };

      const middleware = requireRole(["ADMIN"]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should accept request when user has one of multiple required roles", () => {
      mockRequest.user = {
        id: "user-123",
        email: "moderator@example.com",
        name: "Moderator User",
        roles: ["MODERATOR"],
      };

      const middleware = requireRole(["ADMIN", "MODERATOR"]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should handle user with no roles", () => {
      mockRequest.user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: [],
      };

      const middleware = requireRole(["ADMIN"]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should continue without user when no token provided", () => {
      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should continue without user when invalid token provided", () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      vi.mocked(jwt.verifyAccessToken).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should add user when valid token provided", () => {
      const mockPayload = {
        sub: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["USER"],
      };

      mockRequest.headers = { authorization: "Bearer valid-token" };
      vi.mocked(jwt.verifyAccessToken).mockReturnValue(mockPayload);

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["USER"],
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should continue when authorization header is not Bearer format", () => {
      mockRequest.headers = { authorization: "Basic credentials" };

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
