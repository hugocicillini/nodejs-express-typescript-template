import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/shared/utils/zod";
import { createApiResponse } from "@/presentation/swagger/utils/responseBuilders";
import {
  RoleResponseSchema,
  CreateRoleInputSchema,
  UpdateRoleInputSchema,
  DeleteRoleResponseSchema,
} from "@/presentation/swagger/schemas/RoleSchema";

export const roleRegistry = new OpenAPIRegistry();

roleRegistry.register("Role", RoleResponseSchema);

// GET /roles - Lista roles (requer autenticação)
roleRegistry.registerPath({
  method: "get",
  path: "/roles",
  tags: ["Role"],
  summary: "List all roles",
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(z.array(RoleResponseSchema), "Success"),
});

// GET /roles/:id - Busca role (requer autenticação)
roleRegistry.registerPath({
  method: "get",
  path: "/roles/{id}",
  tags: ["Role"],
  summary: "Get role by ID",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.uuid() }) },
  responses: createApiResponse(RoleResponseSchema, "Success"),
});

// POST /roles - Cria role (requer ADMIN)
roleRegistry.registerPath({
  method: "post",
  path: "/roles",
  tags: ["Role"],
  summary: "Create new role (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRoleInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(RoleResponseSchema, "Success"),
});

// PUT /roles/:id - Atualiza role (requer ADMIN)
roleRegistry.registerPath({
  method: "put",
  path: "/roles/{id}",
  tags: ["Role"],
  summary: "Update role (requires ADMIN)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateRoleInputSchema,
        },
      },
    },
  },
  responses: createApiResponse(RoleResponseSchema, "Success"),
});

// DELETE /roles/:id - Deleta role (requer SUPER_ADMIN)
roleRegistry.registerPath({
  method: "delete",
  path: "/roles/{id}",
  tags: ["Role"],
  summary: "Delete role (requires SUPER_ADMIN)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.uuid() }) },
  responses: createApiResponse(DeleteRoleResponseSchema, "Success"),
});
