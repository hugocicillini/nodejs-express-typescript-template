import { DIContainer } from "@/infrastructure/di";
import {
  CreateRoleSchema,
  DeleteRoleSchema,
  GetRoleSchema,
  UpdateRoleSchema,
} from "@/presentation/validators/roleSchemas";
import { validateRequest } from "@/shared/utils/httpHandlers";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { Router } from "express";

const roleRouter = Router();
const roleController = DIContainer.getRoleController();

// GET /roles - Lista roles (apenas autenticados)
roleRouter.get("/", requireAuth, roleController.getRoles);

// GET /roles/:id - Busca role (apenas autenticados)
roleRouter.get(
  "/:id",
  requireAuth,
  validateRequest(GetRoleSchema),
  roleController.getRole,
);

// POST /roles - Cria role (apenas ADMIN)
roleRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validateRequest(CreateRoleSchema),
  roleController.createRole,
);

// PUT /roles/:id - Atualiza role (apenas ADMIN)
roleRouter.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validateRequest(UpdateRoleSchema),
  roleController.updateRole,
);

// DELETE /roles/:id - Deleta role (apenas SUPER_ADMIN)
roleRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  validateRequest(DeleteRoleSchema),
  roleController.deleteRole,
);

export { roleRouter };
