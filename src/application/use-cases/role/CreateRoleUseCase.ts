import type { IUseCase } from "@/application/interfaces/IUseCase";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import type { IRoleRepository } from "@/domain/interfaces/IRoleRepository";
import { ServiceResponse } from "@/application/models/serviceResponse";
import type { AuditContext } from "@/shared/types/auditContext";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

export interface CreateRoleInput {
  name: RoleName;
  description: string;
  auditContext?: AuditContext;
}

export type CreateRoleOutput = ServiceResponse<ReturnType<
  Role["toJSON"]
> | null>;

export class CreateRoleUseCase
  implements IUseCase<CreateRoleInput, CreateRoleOutput>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: CreateRoleInput): Promise<CreateRoleOutput> {
    try {
      const existingRole = await this.roleRepository.findByName(input.name);

      if (existingRole) {
        return ServiceResponse.failure(
          "Role name already in use",
          null,
          StatusCodes.CONFLICT,
        );
      }

      const role = Role.create({
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const createdRole = await this.roleRepository.create(
        role,
        input.auditContext,
      );

      return ServiceResponse.success(
        "Role created successfully",
        createdRole.toJSON(),
        StatusCodes.CREATED,
      );
    } catch (_error) {
      return ServiceResponse.failure(
        "An error occurred while creating role",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
