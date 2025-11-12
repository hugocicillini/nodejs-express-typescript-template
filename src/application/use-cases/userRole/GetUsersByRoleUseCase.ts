import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

export interface GetUsersByRoleInput {
  roleId: string;
}

export type GetUsersByRoleOutput = ServiceResponse<Array<
  ReturnType<UserRole["toJSON"]>
> | null>;

export class GetUsersByRoleUseCase
  implements IUseCase<GetUsersByRoleInput, GetUsersByRoleOutput>
{
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async execute(input: GetUsersByRoleInput): Promise<GetUsersByRoleOutput> {
    try {
      const userRoles = await this.userRoleRepository.findByRoleId(
        input.roleId,
      );

      if (!userRoles || userRoles.length === 0) {
        return ServiceResponse.failure(
          "No users found with this role",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      return ServiceResponse.success(
        "Users with role found",
        userRoles.map((ur) => ur.toJSON()),
        StatusCodes.OK,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while retrieving users with role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
