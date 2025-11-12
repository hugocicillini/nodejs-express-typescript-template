import type { CreateRoleUseCase } from "@/application/use-cases/role/CreateRoleUseCase";
import type { DeleteRoleUseCase } from "@/application/use-cases/role/DeleteRoleUseCase";
import type { GetRoleByIdUseCase } from "@/application/use-cases/role/GetRoleUseCase";
import type { GetAllRolesUseCase } from "@/application/use-cases/role/ListRolesUseCase";
import type { UpdateRoleUseCase } from "@/application/use-cases/role/UpdateRoleUseCase";
import type { Request, RequestHandler, Response } from "express";

export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getAllRolesUseCase: GetAllRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  getRoles: RequestHandler = async (_req: Request, res: Response) => {
    const result = await this.getAllRolesUseCase.execute();
    res.status(result.statusCode).send(result);
  };

  getRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.getRoleByIdUseCase.execute({
      id: req.params.id as string,
    });
    res.status(result.statusCode).send(result);
  };

  createRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.createRoleUseCase.execute({
      name: req.body.name,
      description: req.body.description,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  updateRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.updateRoleUseCase.execute({
      id: req.params.id as string,
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  deleteRole: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.deleteRoleUseCase.execute({
      id: req.params.id as string,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };
}
