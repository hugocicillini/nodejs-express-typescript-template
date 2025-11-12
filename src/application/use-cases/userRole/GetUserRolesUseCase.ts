import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import { StatusCodes } from "http-status-codes";

export interface GetUserRolesInput {
  userId: string;
}

export type GetUserRolesOutput = ServiceResponse<Array<
  ReturnType<UserRole["toJSON"]>
> | null>;

export class GetUserRolesUseCase
  implements IUseCase<GetUserRolesInput, GetUserRolesOutput>
{
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async execute(input: GetUserRolesInput): Promise<GetUserRolesOutput> {
    try {
      const userRoles = await this.userRoleRepository.findByUserId(
        input.userId,
      );

      if (!userRoles || userRoles.length === 0) {
        return ServiceResponse.failure(
          "No roles found for this user",
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
