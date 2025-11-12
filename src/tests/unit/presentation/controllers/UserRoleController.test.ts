import type { AssignRoleUseCase } from "@/application/use-cases/userRole/AssignRoleUseCase";
import type { GetAllUserRolesUseCase } from "@/application/use-cases/userRole/GetAllUserRolesUseCase";
import type { GetUserRolesUseCase } from "@/application/use-cases/userRole/GetUserRolesUseCase";
import type { GetUsersByRoleUseCase } from "@/application/use-cases/userRole/GetUsersByRoleUseCase";
import type { RemoveAllUserRolesUseCase } from "@/application/use-cases/userRole/RemoveAllUserRolesUseCase";
import type { RemoveRoleUseCase } from "@/application/use-cases/userRole/RemoveRoleUseCase";
import { UserRoleController } from "@/presentation/controllers/UserRoleController";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("UserRoleController", () => {
  let userRoleController: UserRoleController;
  let mockAssignRoleUseCase: AssignRoleUseCase;
  let mockRemoveRoleUseCase: RemoveRoleUseCase;
  let mockGetUserRolesUseCase: GetUserRolesUseCase;
  let mockGetUsersByRoleUseCase: GetUsersByRoleUseCase;
  let mockRemoveAllUserRolesUseCase: RemoveAllUserRolesUseCase;
  let mockGetAllUserRolesUseCase: GetAllUserRolesUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockAssignRoleUseCase = {
      execute: vi.fn(),
    } as any;

    mockRemoveRoleUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetUserRolesUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetUsersByRoleUseCase = {
      execute: vi.fn(),
    } as any;

    mockRemoveAllUserRolesUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetAllUserRolesUseCase = {
      execute: vi.fn(),
    } as any;

    userRoleController = new UserRoleController(
      mockAssignRoleUseCase,
      mockRemoveRoleUseCase,
      mockGetUserRolesUseCase,
      mockGetUsersByRoleUseCase,
      mockRemoveAllUserRolesUseCase,
      mockGetAllUserRolesUseCase,
    );

    mockRequest = {
      body: {},
      params: {},
      headers: {},
      ip: "127.0.0.1",
      user: undefined,
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("getAllUserRoles", () => {
    it("should call GetAllUserRolesUseCase and return all user roles", async () => {
      const mockResult = {
        success: true,
        message: "User roles retrieved successfully",
        responseObject: [
          { userId: "user-1", roleId: "role-1", assignedAt: new Date() },
          { userId: "user-2", roleId: "role-2", assignedAt: new Date() },
        ],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetAllUserRolesUseCase.execute).mockResolvedValue(
        mockResult,
      );

      await userRoleController.getAllUserRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetAllUserRolesUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getUserRoles", () => {
    it("should call GetUserRolesUseCase with correct userId", async () => {
      mockRequest.params = { userId: "user-123" };

      const mockResult = {
        success: true,
        message: "User roles retrieved successfully",
        responseObject: [
          { roleId: "role-1", roleName: "ADMIN", assignedAt: new Date() },
          { roleId: "role-2", roleName: "USER", assignedAt: new Date() },
        ],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetUserRolesUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.getUserRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetUserRolesUseCase.execute).toHaveBeenCalledWith({
        userId: "user-123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle user not found", async () => {
      mockRequest.params = { userId: "non-existent" };

      const mockResult = {
        success: false,
        message: "User not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockGetUserRolesUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.getUserRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getUsersByRole", () => {
    it("should call GetUsersByRoleUseCase with correct roleId", async () => {
      mockRequest.params = { roleId: "role-123" };

      const mockResult = {
        success: true,
        message: "Users retrieved successfully",
        responseObject: [
          { userId: "user-1", userName: "User One", assignedAt: new Date() },
          { userId: "user-2", userName: "User Two", assignedAt: new Date() },
        ],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetUsersByRoleUseCase.execute).mockResolvedValue(
        mockResult,
      );

      await userRoleController.getUsersByRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetUsersByRoleUseCase.execute).toHaveBeenCalledWith({
        roleId: "role-123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle role not found", async () => {
      mockRequest.params = { roleId: "non-existent" };

      const mockResult = {
        success: false,
        message: "Role not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockGetUsersByRoleUseCase.execute).mockResolvedValue(
        mockResult,
      );

      await userRoleController.getUsersByRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("assignRole", () => {
    it("should call AssignRoleUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        userId: "user-456",
        roleId: "role-789",
        expiresAt: new Date("2025-12-31"),
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "Role assigned successfully",
        responseObject: {
          userId: "user-456",
          roleId: "role-789",
          assignedAt: new Date(),
        },
        statusCode: 201,
      } as any;

      vi.mocked(mockAssignRoleUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.assignRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockAssignRoleUseCase.execute).toHaveBeenCalledWith({
        userId: "user-456",
        roleId: "role-789",
        expiresAt: new Date("2025-12-31"),
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle role already assigned", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        userId: "user-456",
        roleId: "role-789",
      };

      const mockResult = {
        success: false,
        message: "Role already assigned to user",
        responseObject: null,
        statusCode: 409,
      } as any;

      vi.mocked(mockAssignRoleUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.assignRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("removeRole", () => {
    it("should call RemoveRoleUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { userId: "user-456", roleId: "role-789" };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "Role removed from user successfully",
        responseObject: null,
        statusCode: 200,
      } as any;

      vi.mocked(mockRemoveRoleUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.removeRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockRemoveRoleUseCase.execute).toHaveBeenCalledWith({
        userId: "user-456",
        roleId: "role-789",
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle role not found for user", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { userId: "user-456", roleId: "non-existent" };

      const mockResult = {
        success: false,
        message: "User role assignment not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockRemoveRoleUseCase.execute).mockResolvedValue(mockResult);

      await userRoleController.removeRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("removeAllUserRoles", () => {
    it("should call RemoveAllUserRolesUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { userId: "user-456" };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        statusCode: 200,
        message: "All roles removed from user successfully",
      } as any;

      vi.mocked(mockRemoveAllUserRolesUseCase.execute).mockResolvedValue(
        mockResult,
      );

      await userRoleController.removeAllUserRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockRemoveAllUserRolesUseCase.execute).toHaveBeenCalledWith({
        userId: "user-456",
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle user not found", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { userId: "non-existent" };

      const mockResult = {
        success: false,
        statusCode: 404,
        message: "User not found",
      } as any;

      vi.mocked(mockRemoveAllUserRolesUseCase.execute).mockResolvedValue(
        mockResult,
      );

      await userRoleController.removeAllUserRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });
});
