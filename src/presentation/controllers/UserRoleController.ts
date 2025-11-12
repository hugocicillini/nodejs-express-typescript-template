import type { AssignRoleUseCase } from "@/application/use-cases/userRole/AssignRoleUseCase";
import type { RemoveRoleUseCase } from "@/application/use-cases/userRole/RemoveRoleUseCase";
import type { GetUserRolesUseCase } from "@/application/use-cases/userRole/GetUserRolesUseCase";
import type { GetUsersByRoleUseCase } from "@/application/use-cases/userRole/GetUsersByRoleUseCase";
import type { RemoveAllUserRolesUseCase } from "@/application/use-cases/userRole/RemoveAllUserRolesUseCase";
import type { GetAllUserRolesUseCase } from "@/application/use-cases/userRole/GetAllUserRolesUseCase";
import type { Request, RequestHandler, Response } from "express";

export class UserRoleController {
  constructor(
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly removeRoleUseCase: RemoveRoleUseCase,
    private readonly getUserRolesUseCase: GetUserRolesUseCase,
    private readonly getUsersByRoleUseCase: GetUsersByRoleUseCase,
    private readonly removeAllUserRolesUseCase: RemoveAllUserRolesUseCase,
    private readonly getAllUserRolesUseCase: GetAllUserRolesUseCase,
  ) {}

  getAllUserRoles: RequestHandler = async (_req: Request, res: Response) => {
    const result = await this.getAllUserRolesUseCase.execute();
    res.status(result.statusCode).send(result);
  };

  getUserRoles: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.getUserRolesUseCase.execute({
      userId: req.params.userId as string,
    });
    res.status(result.statusCode).send(result);
  };

  getUsersByRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.getUsersByRoleUseCase.execute({
      roleId: req.params.roleId as string,
    });
    res.status(result.statusCode).send(result);
  };

  assignRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.assignRoleUseCase.execute({
      userId: req.body.userId,
      roleId: req.body.roleId,
      expiresAt: req.body.expiresAt,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  removeRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.removeRoleUseCase.execute({
      userId: req.params.userId as string,
      roleId: req.params.roleId as string,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  removeAllUserRoles: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.removeAllUserRolesUseCase.execute({
      userId: req.params.userId as string,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };
}
