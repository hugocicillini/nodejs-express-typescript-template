import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export type GetAllUsersInput = void;

export type GetAllUsersOutput = ServiceResponse<Array<
  Omit<ReturnType<User["toJSON"]>, "password">
> | null>;

export class GetAllUsersUseCase
  implements IUseCase<GetAllUsersInput, GetAllUsersOutput>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<GetAllUsersOutput> {
    try {
      const users = await this.userRepository.findAll();

      if (!users || users.length === 0) {
        return ServiceResponse.failure(
          "No users found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const usersWithoutPassword = users.map((user) => user.toJSON());

      return ServiceResponse.success("Users found", usersWithoutPassword);
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while retrieving users",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
