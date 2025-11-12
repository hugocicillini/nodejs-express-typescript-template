import { DIContainer } from "@/infrastructure/di";
import { validateRequest } from "@/shared/utils/httpHandlers";
import { Router } from "express";
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
} from "../validators/authSchemas";
import { requireAuth } from "../middlewares/authMiddleware";

const authRouter = Router();
const authController = DIContainer.getAuthController();

// Rotas públicas
authRouter.post(
  "/register",
  validateRequest(RegisterSchema),
  authController.register,
);

authRouter.post("/login", validateRequest(LoginSchema), authController.login);

authRouter.post(
  "/refresh",
  validateRequest(RefreshTokenSchema),
  authController.refreshToken,
);

// Rotas protegidas
authRouter.post(
  "/logout",
  requireAuth,
  validateRequest(LogoutSchema),
  authController.logout,
);

export { authRouter };
