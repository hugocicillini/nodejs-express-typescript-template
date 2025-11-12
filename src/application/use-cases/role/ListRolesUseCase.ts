import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { Role } from "@/domain/entities/Role";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export type GetAllRolesInput = void;

export type GetAllRolesOutput = ServiceResponse<Array<
  ReturnType<Role["toJSON"]>
> | null>;

export class GetAllRolesUseCase
  implements IUseCase<GetAllRolesInput, GetAllRolesOutput>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<GetAllRolesOutput> {
    try {
      const roles = await this.roleRepository.findAll();

      if (!roles || roles.length === 0) {
        return ServiceResponse.failure(
          "No roles found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const rolesJSON = roles.map((role) => role.toJSON());

      return ServiceResponse.success("Roles found", rolesJSON);
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while retrieving roles",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
