import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { Role } from "@/domain/entities/Role";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export interface GetRoleByIdInput {
  id: string;
}

export type GetRoleByIdOutput = ServiceResponse<ReturnType<
  Role["toJSON"]
> | null>;

export class GetRoleByIdUseCase
  implements IUseCase<GetRoleByIdInput, GetRoleByIdOutput>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: GetRoleByIdInput): Promise<GetRoleByIdOutput> {
    try {
      const role = await this.roleRepository.findById(input.id);

      if (!role) {
        return ServiceResponse.failure(
          "Role not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      return ServiceResponse.success("Role found", role.toJSON());
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while finding role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
