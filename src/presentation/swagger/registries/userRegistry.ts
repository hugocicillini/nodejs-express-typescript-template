import { createApiResponse } from "@/presentation/swagger/utils/responseBuilders";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/shared/utils/zod";
import {
  UserResponseSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
  DeleteUserResponseSchema,
} from "@/presentation/swagger/schemas/UserSchema";

export const userRegistry = new OpenAPIRegistry();

userRegistry.register("User", UserResponseSchema);

// GET /users - Lista usuários (requer autenticação)
userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  summary: "List all users",
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(z.array(UserResponseSchema), "Success"),
});

// GET /users/:id - Busca usuário (requer autenticação)
userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  summary: "Get user by ID",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.uuid() }) },
  responses: createApiResponse(UserResponseSchema, "Success"),
});

// POST /users - Cria usuário (requer ADMIN)
userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  summary: "Create new user (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserResponseSchema, "Success"),
});

// PUT /users/:id - Atualiza usuário (requer autenticação)
userRegistry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["User"],
  summary: "Update user",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateUserInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserResponseSchema, "Success"),
});

// DELETE /users/:id - Deleta usuário (requer SUPER_ADMIN)
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  summary: "Delete user (requires SUPER_ADMIN)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.uuid() }) },
  responses: createApiResponse(DeleteUserResponseSchema, "Success"),
});
