import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { UserController } from "@/presentation/controllers/UserController";
import type { CreateUserUseCase } from "@/application/use-cases/user/CreateUserUseCase";
import type { GetAllUsersUseCase } from "@/application/use-cases/user/GetAllUsersUseCase";
import type { GetUserByIdUseCase } from "@/application/use-cases/user/GetUserByIdUseCase";
import type { UpdateUserUseCase } from "@/application/use-cases/user/UpdateUserUseCase";
import type { DeleteUserUseCase } from "@/application/use-cases/user/DeleteUserUseCase";

describe("UserController", () => {
  let userController: UserController;
  let mockCreateUserUseCase: CreateUserUseCase;
  let mockGetAllUsersUseCase: GetAllUsersUseCase;
  let mockGetUserByIdUseCase: GetUserByIdUseCase;
  let mockUpdateUserUseCase: UpdateUserUseCase;
  let mockDeleteUserUseCase: DeleteUserUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUserUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetAllUsersUseCase = {
      execute: vi.fn(),
    } as any;

    mockGetUserByIdUseCase = {
      execute: vi.fn(),
    } as any;

    mockUpdateUserUseCase = {
      execute: vi.fn(),
    } as any;

    mockDeleteUserUseCase = {
      execute: vi.fn(),
    } as any;

    userController = new UserController(
      mockCreateUserUseCase,
      mockGetAllUsersUseCase,
      mockGetUserByIdUseCase,
      mockUpdateUserUseCase,
      mockDeleteUserUseCase,
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

  describe("getUsers", () => {
    it("should call GetAllUsersUseCase and return users", async () => {
      const mockResult = {
        success: true,
        message: "Users retrieved successfully",
        responseObject: [
          { id: "user-1", email: "user1@example.com", name: "User 1" },
          { id: "user-2", email: "user2@example.com", name: "User 2" },
        ],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetAllUsersUseCase.execute).mockResolvedValue(mockResult);

      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle empty user list", async () => {
      const mockResult = {
        success: true,
        message: "Users retrieved successfully",
        responseObject: [],
        statusCode: 200,
      } as any;

      vi.mocked(mockGetAllUsersUseCase.execute).mockResolvedValue(mockResult);

      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getUser", () => {
    it("should call GetUserByIdUseCase with correct id", async () => {
      mockRequest.params = { id: "user-123" };

      const mockResult = {
        success: true,
        message: "User retrieved successfully",
        responseObject: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockGetUserByIdUseCase.execute).mockResolvedValue(mockResult);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith({
        id: "user-123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle user not found", async () => {
      mockRequest.params = { id: "non-existent" };

      const mockResult = {
        success: false,
        message: "User not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockGetUserByIdUseCase.execute).mockResolvedValue(mockResult);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("createUser", () => {
    it("should call CreateUserUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        email: "newuser@example.com",
        name: "New User",
        password: "password123",
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "User created successfully",
        responseObject: {
          id: "user-456",
          email: "newuser@example.com",
          name: "New User",
        },
        statusCode: 201,
      } as any;

      vi.mocked(mockCreateUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
        email: "newuser@example.com",
        name: "New User",
        password: "password123",
        auditContext: {
          performedByUserId: "admin-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle email already exists", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.body = {
        email: "existing@example.com",
        name: "New User",
        password: "password123",
      };

      const mockResult = {
        success: false,
        message: "Email already exists",
        responseObject: null,
        statusCode: 409,
      } as any;

      vi.mocked(mockCreateUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("updateUser", () => {
    it("should call UpdateUserUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "user-123" };
      mockRequest.params = { id: "user-123" };
      mockRequest.body = {
        name: "Updated Name",
        password: "newpassword123",
      };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "User updated successfully",
        responseObject: {
          id: "user-123",
          email: "test@example.com",
          name: "Updated Name",
        },
        statusCode: 200,
      } as any;

      vi.mocked(mockUpdateUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
        id: "user-123",
        name: "Updated Name",
        password: "newpassword123",
        auditContext: {
          performedByUserId: "user-123",
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle update failure", async () => {
      (mockRequest as any).user = { id: "user-123" };
      mockRequest.params = { id: "user-456" };
      mockRequest.body = { name: "Updated Name" };

      const mockResult = {
        success: false,
        message: "User not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockUpdateUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("deleteUser", () => {
    it("should call DeleteUserUseCase with correct parameters", async () => {
      (mockRequest as any).user = { id: "admin-123" };
      mockRequest.params = { id: "user-456" };
      mockRequest.headers = { "user-agent": "test-agent" };

      const mockResult = {
        success: true,
        message: "User deleted successfully",
        responseObject: null,
        statusCode: 200,
      } as any;

      vi.mocked(mockDeleteUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({
        id: "user-456",
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
        message: "User not found",
        responseObject: null,
        statusCode: 404,
      } as any;

      vi.mocked(mockDeleteUserUseCase.execute).mockResolvedValue(mockResult);

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult);
    });
  });
});
