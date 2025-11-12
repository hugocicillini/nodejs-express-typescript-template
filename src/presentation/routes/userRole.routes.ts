import { DIContainer } from "@/infrastructure/di";
import { validateRequest } from "@/shared/utils/httpHandlers";
import { Router } from "express";
import {
  AssignRoleSchema,
  GetUserRolesSchema,
  GetUsersByRoleSchema,
  RemoveAllUserRolesSchema,
  RemoveRoleSchema,
} from "../validators/userRoleSchemas";

const userRoleRouter = Router();
const userRoleController = DIContainer.getUserRoleController();

userRoleRouter.get("/", userRoleController.getAllUserRoles);

userRoleRouter.get(
  "/user/:userId",
  validateRequest(GetUserRolesSchema),
  userRoleController.getUserRoles,
);

userRoleRouter.get(
  "/role/:roleId",
  validateRequest(GetUsersByRoleSchema),
  userRoleController.getUsersByRole,
);

userRoleRouter.post(
  "/",
  validateRequest(AssignRoleSchema),
  userRoleController.assignRole,
);

userRoleRouter.delete(
  "/:userId/:roleId",
  validateRequest(RemoveRoleSchema),
  userRoleController.removeRole,
);

userRoleRouter.delete(
  "/user/:userId/all",
  validateRequest(RemoveAllUserRolesSchema),
  userRoleController.removeAllUserRoles,
);

export { userRoleRouter };
