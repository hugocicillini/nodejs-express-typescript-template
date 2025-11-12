import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import { StatusCodes } from "http-status-codes";

export interface RemoveAllUserRolesInput {
  userId: string;
  auditContext?: AuditContext;
}

export type RemoveAllUserRolesOutput = ServiceResponse<{
  success: boolean;
  message: string;
  count: number;
} | null>;

export class RemoveAllUserRolesUseCase
  implements IUseCase<RemoveAllUserRolesInput, RemoveAllUserRolesOutput>
{
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async execute(
    input: RemoveAllUserRolesInput,
  ): Promise<RemoveAllUserRolesOutput> {
    try {
      const currentRoles = await this.userRoleRepository.findByUserId(
        input.userId,
      );

      if (!currentRoles || currentRoles.length === 0) {
        return ServiceResponse.failure(
          "No roles found for this user",
          {
            success: true,
            message: "User has no roles to remove",
            count: 0,
          },
          StatusCodes.NOT_FOUND,
        );
      }

      const deletedCount = await this.userRoleRepository.deleteAllByUserId(
        input.userId,
        {
          ...input.auditContext,
          payload: {
            userId: input.userId,
            action: "ALL_ROLES_REMOVED",
            removedRoles: currentRoles.map((ur) => ({
              roleId: ur.roleId,
            })),
            count: currentRoles.length,
          },
        },
      );

      return ServiceResponse.success(
        "All roles removed from user successfully",
        {
          success: true,
          message: `${deletedCount} role(s) removed`,
          count: deletedCount,
        },
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while removing all roles",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
