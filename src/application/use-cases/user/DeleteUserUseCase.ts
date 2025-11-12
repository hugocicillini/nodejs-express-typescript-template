import type { IUseCase } from "@/application/interfaces/IUseCase";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export interface DeleteUserInput {
  id: string;
  auditContext?: AuditContext;
}

export type DeleteUserOutput = ServiceResponse<{
  success: boolean;
  message: string;
} | null>;

export class DeleteUserUseCase
  implements IUseCase<DeleteUserInput, DeleteUserOutput>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    try {
      const user = await this.userRepository.findById(input.id);

      if (!user) {
        return ServiceResponse.failure(
          "User not found or already deleted",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      await this.userRepository.delete(input.id, input.auditContext);

      return ServiceResponse.success("User deleted successfully", {
        success: true,
        message: "User has been soft deleted",
      });
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while deleting user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
