import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import { User } from "@/domain/entities/User";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  auditContext?: AuditContext;
}

export interface RegisterOutput {
  user: Omit<ReturnType<User["toJSON"]>, "password">;
  accessToken: string;
  refreshToken: string;
}

export type RegisterResponse = ServiceResponse<RegisterOutput | null>;

export class RegisterUseCase
  implements IUseCase<RegisterInput, RegisterResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterResponse> {
    try {
      // Verificar se email já existe
      const existingUser = await this.userRepository.findByEmail(input.email);

      if (existingUser) {
        return ServiceResponse.failure(
          "Email already in use",
          null,
          StatusCodes.CONFLICT,
        );
      }

      // Hash da senha
      const hashedPassword = await this.passwordHasher.hash(input.password);

      // Criar usuário
      const user = User.create({
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const createdUser = await this.userRepository.create(
        user,
        input.auditContext,
      );

      // Buscar roles do usuário (pode não ter ainda)
      const userRoles = await this.userRoleRepository.findByUserId(user.id);
      const roleNames = userRoles.map((ur) => ur.roleId); // Simplificado - idealmente buscar nome da role

      // Gerar tokens
      const accessToken = this.jwtService.generateAccessToken(
        createdUser.id,
        createdUser.email,
        createdUser.name,
        roleNames,
      );

      const tokenId = crypto.randomUUID();
      const refreshTokenString = this.jwtService.generateRefreshToken(
        createdUser.id,
        tokenId,
      );

      // Salvar refresh token no banco
      const refreshToken = RefreshToken.create({
        id: tokenId,
        token: refreshTokenString,
        userId: createdUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await this.refreshTokenRepository.create(refreshToken);

      return ServiceResponse.success(
        "User registered successfully",
        {
          user: createdUser.toJSON(),
          accessToken,
          refreshToken: refreshTokenString,
        },
        StatusCodes.CREATED,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while registering user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
