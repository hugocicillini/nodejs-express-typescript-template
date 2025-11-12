import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

export type GetAllUserRolesOutput = ServiceResponse<Array<
  ReturnType<UserRole["toJSON"]>
> | null>;

export class GetAllUserRolesUseCase
  implements IUseCase<void, GetAllUserRolesOutput>
{
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async execute(): Promise<GetAllUserRolesOutput> {
    try {
      const userRoles = await this.userRoleRepository.findAll();

      if (!userRoles || userRoles.length === 0) {
        return ServiceResponse.failure(
          "No user roles found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      return ServiceResponse.success(
        "User roles found",
        userRoles.map((ur) => ur.toJSON()),
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while retrieving user roles",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
