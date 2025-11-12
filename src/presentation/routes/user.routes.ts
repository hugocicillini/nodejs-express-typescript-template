import { DIContainer } from "@/infrastructure/di";
import { validateRequest } from "@/shared/utils/httpHandlers";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { Router } from "express";
import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserSchema,
  UpdateUserSchema,
} from "../validators/userSchemas";

const userRouter = Router();
const userController = DIContainer.getUserController();

// GET /users - Lista usuários (apenas autenticados)
userRouter.get("/", requireAuth, userController.getUsers);

// GET /users/:id - Busca usuário (apenas autenticados)
userRouter.get(
  "/:id",
  requireAuth,
  validateRequest(GetUserSchema),
  userController.getUser,
);

// POST /users - Cria usuário (apenas ADMIN)
userRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validateRequest(CreateUserSchema),
  userController.createUser,
);

// PUT /users/:id - Atualiza usuário (próprio usuário ou ADMIN)
userRouter.put(
  "/:id",
  requireAuth,
  validateRequest(UpdateUserSchema),
  userController.updateUser,
);

// DELETE /users/:id - Deleta usuário (apenas SUPER_ADMIN)
userRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  validateRequest(DeleteUserSchema),
  userController.deleteUser,
);

export { userRouter };
