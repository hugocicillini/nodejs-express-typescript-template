import type { CreateUserUseCase } from "@/application/use-cases/user/CreateUserUseCase";
import type { DeleteUserUseCase } from "@/application/use-cases/user/DeleteUserUseCase";
import type { GetAllUsersUseCase } from "@/application/use-cases/user/GetAllUsersUseCase";
import type { GetUserByIdUseCase } from "@/application/use-cases/user/GetUserByIdUseCase";
import type { UpdateUserUseCase } from "@/application/use-cases/user/UpdateUserUseCase";
import type { Request, RequestHandler, Response } from "express";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const result = await this.getAllUsersUseCase.execute();
    res.status(result.statusCode).send(result);
  };

  getUser: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.getUserByIdUseCase.execute({
      id: req.params.id as string,
    });
    res.status(result.statusCode).send(result);
  };

  createUser: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.createUserUseCase.execute({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  updateUser: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.updateUserUseCase.execute({
      id: req.params.id as string,
      name: req.body.name,
      password: req.body.password,
      auditContext: {
        performedByUserId: (req as any).user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  deleteUser: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.deleteUserUseCase.execute({
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
