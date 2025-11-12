import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { RoleController } from "@/presentation/controllers/RoleController";
import type { CreateRoleUseCase } from "@/application/use-cases/role/CreateRoleUseCase";
import type { GetAllRolesUseCase } from "@/application/use-cases/role/ListRolesUseCase";
import type { GetRoleByIdUseCase } from "@/application/use-cases/role/GetRoleUseCase";
import type { UpdateRoleUseCase } from "@/application/use-cases/role/UpdateRoleUseCase";
import type { DeleteRoleUseCase } from "@/application/use-cases/role/DeleteRoleUseCase";

describe("RoleController", () => {
  let roleController: RoleController;
  let mockCreateRoleUseCase: CreateRoleUseCase;
  let mockGetAllRolesUseCase: GetAllRolesUseCase;
  let mockGetRoleByIdUseCase: GetRoleByIdUseCase;
  let mockUpdateRoleUseCase: UpdateRoleUseCase;
  let mockDeleteRoleUseCase: DeleteRoleUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateRoleUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetAllRolesUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetRoleByIdUseCase = {
      execute: vi.fn(),
    } as any;

    mockUpdateRoleUseCase = {
      execute: vi.fn(),
    } as any;

    mockDeleteRoleUseCase = {
      execute: vi.fn(),
    } as any;

    roleController = new RoleController(
      mockCreateRoleUseCase,
      mockGetAllRolesUseCase,
      mockGetRoleByIdUseCase,
      mockUpdateRoleUseCase,
      mockDeleteRoleUseCase,
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

  describe("getRoles", () => {
    it("should call GetAllRolesUseCase and return roles", async () => {
      const mockResult = {
        success: true,
        message: "Roles retrieved successfully",
        responseObject: [
          { id: "role-1", name: "ADMIN", description: "Administrator role" },
          { id: "role-2", name: "USER", description: "Regular user role" },
        ],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetAllRolesUseCase.execute).mockResolvedValue(mockResult);

      await roleController.getRoles(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getRole", () => {
    it("should call GetRoleByIdUseCase with correct id", async () => {
      mockRequest.params = { id: "role-123" };

      const mockResult = {
        success: true,
        message: "Role retrieved successfully",
        responseObject: {
          id: "role-123",
          name: "ADMIN",
          description: "Administrator role",
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockGetRoleByIdUseCase.execute).mockResolvedValue(mockResult);

      await roleController.getRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetRoleByIdUseCase.execute).toHaveBeenCalledWith({
        id: "role-123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle role not found", async () => {
      mockRequest.params = { id: "non-existent" };

      const mockResult = {
        success: false,
        message: "Role not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockGetRoleByIdUseCase.execute).mockResolvedValue(mockResult);

      await roleController.getRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("createRole", () => {
    it("should call CreateRoleUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        name: "MODERATOR",
        description: "Moderator role",
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "Role created successfully",
        responseObject: {
          id: "role-456",
          name: "MODERATOR",
          description: "Moderator role",
        },
        statusCode: 201,
      } as any;

      vi.mocked(mockCreateRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.createRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockCreateRoleUseCase.execute).toHaveBeenCalledWith({
        name: "MODERATOR",
        description: "Moderator role",
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle role already exists", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        name: "ADMIN",
        description: "Administrator role",
      };

      const mockResult = {
        success: false,
        message: "Role already exists",
        responseObject: null,
        statusCode: 409,
      } as any;

      vi.mocked(mockCreateRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.createRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("updateRole", () => {
    it("should call UpdateRoleUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { id: "role-123" };
      mockRequest.body = {
        name: "UPDATED_ROLE",
        description: "Updated description",
        isActive: false,
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "Role updated successfully",
        responseObject: {
          id: "role-123",
          name: "UPDATED_ROLE",
          description: "Updated description",
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockUpdateRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.updateRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockUpdateRoleUseCase.execute).toHaveBeenCalledWith({
        id: "role-123",
        name: "UPDATED_ROLE",
        description: "Updated description",
        isActive: false,
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle update failure", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { id: "role-456" };
      mockRequest.body = { name: "UPDATED_ROLE" };

      const mockResult = {
        success: false,
        message: "Role not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockUpdateRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.updateRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("deleteRole", () => {
    it("should call DeleteRoleUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { id: "role-456" };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "Role deleted successfully",
        responseObject: null,
        statusCode: 200,
      } as any;

      vi.mocked(mockDeleteRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.deleteRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockDeleteRoleUseCase.execute).toHaveBeenCalledWith({
        id: "role-456",
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle delete failure", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { id: "non-existent" };

      const mockResult = {
        success: false,
        message: "Role not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockDeleteRoleUseCase.execute).mockResolvedValue(mockResult);

      await roleController.deleteRole(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });
});
