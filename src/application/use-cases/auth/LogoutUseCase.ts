import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { IRefreshTokenRepository } from "@/domain/interfaces/IRefreshTokenRepository";
import { StatusCodes } from "http-status-codes";

export interface LogoutInput {
  userId: string;
  refreshToken?: string; // opcional - pode invalidar apenas um ou todos
}

export interface LogoutOutput {
  success: boolean;
  message: string;
}

export type LogoutResponse = ServiceResponse<LogoutOutput | null>;

export class LogoutUseCase implements IUseCase<LogoutInput, LogoutResponse> {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<LogoutResponse> {
    try {
      if (input.refreshToken) {
        // Invalidar apenas o token específico
        await this.refreshTokenRepository.deleteByToken(input.refreshToken);
      } else {
        // Invalidar todos os tokens do usuário
        await this.refreshTokenRepository.deleteAllByUserId(input.userId);
      }

      return ServiceResponse.success(
        "Logout successful",
        {
          success: true,
          message: "All sessions have been terminated",
        },
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred during logout",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
