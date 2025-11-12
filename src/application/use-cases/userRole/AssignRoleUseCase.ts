import type { IUseCase } from "@/application/interfaces/IUseCase";
import { ServiceResponse } from "@/application/models/serviceResponse";
import { UserRole } from "@/domain/entities/UserRole";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { IUserRoleRepository } from "@/domain/interfaces/IUserRoleRepository";
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
      const user = await this.userRepository.findById(input.userId);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const role = await this.roleRepository.findById(input.roleId);
      if (!role) {
        return ServiceResponse.failure(
          "Role not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

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

      // const userCurrentRoles = await this.userRoleRepository.findByUserId(
      //   input.userId
      // );

      // if (userCurrentRoles && userCurrentRoles.length > 0) {
      //   const activeRoles = userCurrentRoles.filter((ur) => ur.isActive);

      //   if (activeRoles.length > 0) {
      //     return ServiceResponse.failure(
      //       'User already has an active role assigned. Please remove it before assigning a new one.',
      //       null,
      //       StatusCodes.CONFLICT
      //     );
      //   }
      // }

      const userRole = UserRole.create({
        id: crypto.randomUUID(),
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: input.auditContext?.performedByUserId || null,
        expiresAt: input.expiresAt || null,
        isActive: true,
      });

      const createdUserRole = await this.userRoleRepository.create(userRole, {
        ...input.auditContext,
        payload: {
          userId: input.userId,
          roleId: input.roleId,
          action: "ROLE_ASSIGNED",
        },
      });

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
