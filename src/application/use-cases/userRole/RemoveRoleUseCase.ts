import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import { StatusCodes } from "http-status-codes";

export interface RemoveRoleInput {
  userId: string;
  roleId: string;
  auditContext?: AuditContext;
}

export type RemoveRoleOutput = ServiceResponse<{
  success: boolean;
  message: string;
} | null>;

export class RemoveRoleUseCase
  implements IUseCase<RemoveRoleInput, RemoveRoleOutput>
{
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async execute(input: RemoveRoleInput): Promise<RemoveRoleOutput> {
    try {
      const existingUserRole = await this.userRoleRepository.findByUserAndRole(
        input.userId,
        input.roleId,
      );

      if (!existingUserRole) {
        return ServiceResponse.failure(
          "User role assignment not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const deleted = await this.userRoleRepository.deleteByUserAndRole(
        input.userId,
        input.roleId,
        input.auditContext,
      );

      if (!deleted) {
        return ServiceResponse.failure(
          "Failed to remove role from user",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return ServiceResponse.success(
        "Role removed from user successfully",
        {
          success: true,
          message: "Role assignment deleted",
        },
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while removing role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
