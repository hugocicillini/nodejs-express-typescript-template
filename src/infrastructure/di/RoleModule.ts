import { CreateRoleUseCase } from "@/application/use-cases/role/CreateRoleUseCase";
import { DeleteRoleUseCase } from "@/application/use-cases/role/DeleteRoleUseCase";
import { GetRoleByIdUseCase } from "@/application/use-cases/role/GetRoleUseCase";
import { GetAllRolesUseCase } from "@/application/use-cases/role/ListRolesUseCase";
import { UpdateRoleUseCase } from "@/application/use-cases/role/UpdateRoleUseCase";
import { PrismaRoleRepository } from "@/infrastructure/repositories/PrismaRoleRepository";
import { RoleController } from "@/presentation/controllers/RoleController";

export class RoleModule {
  private static roleRepository: PrismaRoleRepository;

  static getRoleRepository(): PrismaRoleRepository {
    if (!this.roleRepository) {
      this.roleRepository = new PrismaRoleRepository();
    }
    return this.roleRepository;
  }

  static getRoleController(): RoleController {
    const roleRepository = this.getRoleRepository();

    const createRoleUseCase = new CreateRoleUseCase(roleRepository);
    const getAllRolesUseCase = new GetAllRolesUseCase(roleRepository);
    const getRoleByIdUseCase = new GetRoleByIdUseCase(roleRepository);
    const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
    const deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);

    return new RoleController(
      createRoleUseCase,
      getAllRolesUseCase,
      getRoleByIdUseCase,
      updateRoleUseCase,
      deleteRoleUseCase,
    );
  }
}
