import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { AuditContext } from "@/shared/types/auditContext";
import { StatusCodes } from "http-status-codes";

export interface DeleteRoleInput {
  id: string;
  auditContext?: AuditContext;
}

export type DeleteRoleOutput = ServiceResponse<{
  success: boolean;
  message: string;
} | null>;

export class DeleteRoleUseCase
  implements IUseCase<DeleteRoleInput, DeleteRoleOutput>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: DeleteRoleInput): Promise<DeleteRoleOutput> {
    try {
      const role = await this.roleRepository.findById(input.id);

      if (!role) {
        return ServiceResponse.failure(
          "Role not found or already deleted",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      await this.roleRepository.delete(input.id, input.auditContext);

      return ServiceResponse.success("Role deleted successfully", {
        success: true,
        message: "Role has been soft deleted",
      });
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while deleting role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
