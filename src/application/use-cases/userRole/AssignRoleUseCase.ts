import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { UserRole } from "@/domain/entities/UserRole";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import type { AuditContext } from "@/shared/types/auditContext";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface AssignRoleInput {
  userId: string;
  roleId: string;
  expiresAt?: Date | null;
  auditContext?: AuditContext;
}

export type AssignRoleOutput = ServiceResponse<ReturnType<
  UserRole["toJSON"]
> | null>;

export class AssignRoleUseCase
  implements IUseCase<AssignRoleInput, AssignRoleOutput>
{
  constructor(
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(input: AssignRoleInput): Promise<AssignRoleOutput> {
    try {
      // Validate user exists and is active
      const user = await this.userRepository.findById(input.userId);
      if (!user || !user.isActive) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      // Validate role exists and is active
      const role = await this.roleRepository.findById(input.roleId);
      if (!role || !role.isActive) {
        return ServiceResponse.failure(
          "Role not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      // Check if user already has this role
      const existingUserRole = await this.userRoleRepository.findByUserAndRole(
        input.userId,
        input.roleId,
      );

      if (existingUserRole) {
        return ServiceResponse.failure(
          "User already has this role",
          null,
          StatusCodes.CONFLICT,
        );
      }

      const userRole = UserRole.create({
        id: crypto.randomUUID(),
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: input.auditContext?.performedByUserId || null,
        expiresAt: input.expiresAt || null,
        isActive: true,
      });

      const createdUserRole = await this.userRoleRepository.create(
        userRole,
        input.auditContext,
      );

      return ServiceResponse.success(
        "Role assigned to user successfully",
        createdUserRole.toJSON(),
        StatusCodes.CREATED,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while assigning role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
