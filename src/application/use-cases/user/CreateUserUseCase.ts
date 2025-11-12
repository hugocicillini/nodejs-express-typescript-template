import type { IUseCase } from "@/application/interfaces/IUseCase";
import { User } from "@/domain/entities/User";
import type { IPasswordHasher } from "@/domain/interfaces/IPasswordHasher";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { AuditContext } from "@/shared/types/auditContext";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  auditContext?: AuditContext;
}

export type CreateUserOutput = ServiceResponse<ReturnType<
  User["toJSON"]
> | null>;

export class CreateUserUseCase
  implements IUseCase<CreateUserInput, CreateUserOutput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const existingUser = await this.userRepository.findByEmail(input.email);

      if (existingUser) {
        return ServiceResponse.failure(
          "Email already in use",
          null,
          StatusCodes.CONFLICT,
        );
      }

      const hashedPassword = await this.passwordHasher.hash(input.password);

      const user = User.create({
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const createdUser = await this.userRepository.create(
        user,
        input.auditContext,
      );

      return ServiceResponse.success(
        "User created successfully",
        createdUser.toJSON(),
        StatusCodes.CREATED,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while creating user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
