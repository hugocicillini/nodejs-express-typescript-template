import type { IUseCase } from "@/application/interfaces/IUseCase";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { IJwtService } from "@/domain/interfaces/IJwtService";
import { ServiceResponse } from "@/application/models/serviceResponse";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenResponse = ServiceResponse<RefreshTokenOutput | null>;

export class RefreshTokenUseCase
  implements IUseCase<RefreshTokenInput, RefreshTokenResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
    try {
      // Verificar token JWT
      let payload;
      try {
        payload = this.jwtService.verifyRefreshToken(input.refreshToken);
      } catch (_error) {
        return ServiceResponse.failure(
          "Invalid or expired refresh token",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Buscar token no banco
      const storedToken = await this.refreshTokenRepository.findByToken(
        input.refreshToken,
      );

      if (!storedToken) {
        return ServiceResponse.failure(
          "Refresh token not found",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Verificar se token está expirado
      if (storedToken.isExpired()) {
        return ServiceResponse.failure(
          "Refresh token expired",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Buscar usuário
      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.isActive) {
        return ServiceResponse.failure(
          "User not found or inactive",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Buscar roles
      const userRoles = await this.userRoleRepository.findByUserId(user.id);
      const roleNames = userRoles.map((ur) => ur.roleId);

      // Revogar token antigo
      await this.refreshTokenRepository.deleteByToken(input.refreshToken);

      // Gerar novos tokens
      const accessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.name,
        roleNames,
      );

      const newTokenId = crypto.randomUUID();
      const newRefreshTokenString = this.jwtService.generateRefreshToken(
        user.id,
        newTokenId,
      );

      // Salvar novo refresh token
      const newRefreshToken = RefreshToken.create({
        id: newTokenId,
        token: newRefreshTokenString,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await this.refreshTokenRepository.create(newRefreshToken);

      return ServiceResponse.success(
        "Token refreshed successfully",
        {
          accessToken,
          refreshToken: newRefreshTokenString,
        },
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while refreshing token",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
