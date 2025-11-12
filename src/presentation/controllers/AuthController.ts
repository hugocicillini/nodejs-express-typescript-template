import type { RegisterUseCase } from "@/application/use-cases/auth/RegisterUseCase";
import type { LoginUseCase } from "@/application/use-cases/auth/LoginUseCase";
import type { RefreshTokenUseCase } from "@/application/use-cases/auth/RefreshTokenUseCase";
import type { LogoutUseCase } from "@/application/use-cases/auth/LogoutUseCase";
import type { Request, RequestHandler, Response } from "express";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  register: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      auditContext: {
        performedByUserId: null,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };

  login: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute({
      email: req.body.email,
      password: req.body.password,
    });
    res.status(result.statusCode).send(result);
  };

  refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.refreshTokenUseCase.execute({
      refreshToken: req.body.refreshToken,
    });
    res.status(result.statusCode).send(result);
  };

  logout: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.logoutUseCase.execute({
      userId: (req as any).user?.id,
      refreshToken: req.body.refreshToken,
    });
    res.status(result.statusCode).send(result);
  };
}
