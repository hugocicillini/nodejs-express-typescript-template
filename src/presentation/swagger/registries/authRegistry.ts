import {
  AuthResponseSchema,
  LoginInputSchema,
  LogoutInputSchema,
  LogoutResponseSchema,
  RefreshTokenInputSchema,
  RefreshTokenResponseSchema,
  RegisterInputSchema,
} from "@/presentation/swagger/schemas/AuthSchema";
import { createApiResponse } from "@/presentation/swagger/utils/responseBuilders";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const authRegistry = new OpenAPIRegistry();

authRegistry.register("Auth", AuthResponseSchema);

// POST /auth/register
authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  description: "Create a new user account and receive authentication tokens",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    AuthResponseSchema,
    "User registered successfully",
  ),
});

// POST /auth/login
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login",
  description: "Authenticate with email and password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(AuthResponseSchema, "Login successful"),
});

// POST /auth/refresh
authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token",
  description:
    "Generate new access and refresh tokens using a valid refresh token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshTokenInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    RefreshTokenResponseSchema,
    "Token refreshed successfully",
  ),
});

// POST /auth/logout
authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout",
  description: "Invalidate refresh tokens and logout user",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LogoutInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(LogoutResponseSchema, "Logout successful"),
});
