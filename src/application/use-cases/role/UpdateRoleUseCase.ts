import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { Role } from "@/domain/entities/Role";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { AuditContext } from "@/shared/types/auditContext";
import { StatusCodes } from "http-status-codes";

export interface UpdateRoleInput {
  id: string;
  name?: RoleName;
  description?: string;
  isActive?: boolean;
  auditContext?: AuditContext;
}

export type UpdateRoleOutput = ServiceResponse<ReturnType<
  Role["toJSON"]
> | null>;

export class UpdateRoleUseCase
  implements IUseCase<UpdateRoleInput, UpdateRoleOutput>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: UpdateRoleInput): Promise<UpdateRoleOutput> {
    try {
      const role = await this.roleRepository.findById(input.id);

      if (!role) {
        return ServiceResponse.failure(
          "Role not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      if (input.name && input.name !== role.name) {
        const existingRole = await this.roleRepository.findByName(input.name);
        if (existingRole && existingRole.id !== role.id) {
          return ServiceResponse.failure(
            "A role with this name already exists",
            null,
            StatusCodes.CONFLICT,
          );
        }
        role.updateName(input.name);
      }

      if (input.description !== undefined) {
        role.updateDescription(input.description);
      }

      if (input.isActive !== undefined) {
        if (input.isActive) {
          role.activate();
        } else {
          role.deactivate();
        }
      }

      const updatedRole = await this.roleRepository.update(
        role,
        input.auditContext,
      );

      return ServiceResponse.success(
        "Role updated successfully",
        updatedRole.toJSON(),
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while updating role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
