import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export interface GetUserByIdInput {
  id: string;
}

export type GetUserByIdOutput = ServiceResponse<Omit<
  ReturnType<User["toJSON"]>,
  "password"
> | null>;

export class GetUserByIdUseCase
  implements IUseCase<GetUserByIdInput, GetUserByIdOutput>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    try {
      const user = await this.userRepository.findById(input.id);

      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      return ServiceResponse.success("User found", user.toJSON());
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while finding user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
