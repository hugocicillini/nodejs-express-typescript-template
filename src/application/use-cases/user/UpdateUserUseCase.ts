import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { User } from "@/domain/entities/User";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export interface UpdateUserInput {
  id: string;
  name?: string;
  password?: string;
  auditContext?: AuditContext;
}

export type UpdateUserOutput = ServiceResponse<Omit<
  ReturnType<User["toJSON"]>,
  "password"
> | null>;

export class UpdateUserUseCase
  implements IUseCase<UpdateUserInput, UpdateUserOutput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    try {
      const user = await this.userRepository.findById(input.id);

      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      if (input.name) {
        user.updateName(input.name);
      }

      if (input.password) {
        const hashedPassword = await this.passwordHasher.hash(input.password);
        user.updatePassword(hashedPassword);
      }

      const updatedUser = await this.userRepository.update(
        user,
        input.auditContext,
      );

      return ServiceResponse.success(
        "User updated successfully",
        updatedUser.toJSON(),
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while updating user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
