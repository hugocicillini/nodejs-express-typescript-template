import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import { UserNotFoundException } from "@/domain/exceptions/UserNotFoundException";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = ServiceResponse<LoginOutput | null>;

export class LoginUseCase implements IUseCase<LoginInput, LoginResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResponse> {
    try {
      const user = await this.userRepository.findByEmail(input.email);

      if (!user) {
        throw new UserNotFoundException(input.email);
      }

      // Verificar senha
      const isPasswordValid = await this.passwordHasher.compare(
        input.password,
        user.password,
      );

      if (!isPasswordValid) {
        return ServiceResponse.failure(
          "Invalid credentials",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        return ServiceResponse.failure(
          "User account is inactive",
          null,
          StatusCodes.FORBIDDEN,
        );
      }

      // Buscar roles do usuário
      const userRoles = await this.userRoleRepository.findByUserId(user.id);
      const roleNames = userRoles.map((ur) => ur.roleId); // Simplificado

      // Gerar tokens
      const accessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.name,
        roleNames,
      );

      const tokenId = crypto.randomUUID();
      const refreshTokenString = this.jwtService.generateRefreshToken(
        user.id,
        tokenId,
      );

      // Salvar refresh token
      const refreshToken = RefreshToken.create({
        id: tokenId,
        token: refreshTokenString,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await this.refreshTokenRepository.create(refreshToken);

      return ServiceResponse.success(
        "Login successful",
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          accessToken,
          refreshToken: refreshTokenString,
        },
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred during login",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
