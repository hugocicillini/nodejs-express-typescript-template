import {
  AssignRoleInputSchema,
  RemoveAllUserRolesResponseSchema,
  RemoveRoleResponseSchema,
  UserRoleResponseSchema,
} from "@/presentation/swagger/schemas/UserRoleSchema";
import { createApiResponse } from "@/presentation/swagger/utils/responseBuilders";
import { z } from "@/shared/utils/zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const userRoleRegistry = new OpenAPIRegistry();

userRoleRegistry.register("UserRole", UserRoleResponseSchema);

// GET /user-roles - Get all user roles (requer ADMIN)
userRoleRegistry.registerPath({
  method: "get",
  path: "/user-roles",
  tags: ["UserRole"],
  summary: "Get all user role assignments (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(z.array(UserRoleResponseSchema), "Success"),
});

// GET /user-roles/user/{userId} - Get roles for a specific user (requer autenticação)
userRoleRegistry.registerPath({
  method: "get",
  path: "/user-roles/user/{userId}",
  tags: ["UserRole"],
  summary: "Get roles assigned to a user",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ userId: z.string().uuid() }) },
  responses: createApiResponse(z.array(UserRoleResponseSchema), "Success"),
});

// GET /user-roles/role/{roleId} - Get users with a specific role (requer ADMIN)
userRoleRegistry.registerPath({
  method: "get",
  path: "/user-roles/role/{roleId}",
  tags: ["UserRole"],
  summary: "Get users with a specific role (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ roleId: z.string().uuid() }) },
  responses: createApiResponse(z.array(UserRoleResponseSchema), "Success"),
});

// POST /user-roles - Assign role to user (requer ADMIN)
userRoleRegistry.registerPath({
  method: "post",
  path: "/user-roles",
  tags: ["UserRole"],
  summary: "Assign a role to a user (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AssignRoleInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserRoleResponseSchema, "Success"),
});

// DELETE /user-roles/{userId}/{roleId} - Remove specific role from user (requer ADMIN)
userRoleRegistry.registerPath({
  method: "delete",
  path: "/user-roles/{userId}/{roleId}",
  tags: ["UserRole"],
  summary: "Remove a specific role from a user (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string().uuid(),
      roleId: z.string().uuid(),
    }),
  },
  responses: createApiResponse(RemoveRoleResponseSchema, "Success"),
});

// DELETE /user-roles/user/{userId}/all - Remove all roles from user (requer ADMIN)
userRoleRegistry.registerPath({
  method: "delete",
  path: "/user-roles/user/{userId}/all",
  tags: ["UserRole"],
  summary: "Remove all roles from a user (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ userId: z.string().uuid() }) },
  responses: createApiResponse(RemoveAllUserRolesResponseSchema, "Success"),
});
