import { AssignRoleUseCase } from "@/application/use-cases/userRole/AssignRoleUseCase";
import { GetAllUserRolesUseCase } from "@/application/use-cases/userRole/GetAllUserRolesUseCase";
import { GetUserRolesUseCase } from "@/application/use-cases/userRole/GetUserRolesUseCase";
import { GetUsersByRoleUseCase } from "@/application/use-cases/userRole/GetUsersByRoleUseCase";
import { RemoveAllUserRolesUseCase } from "@/application/use-cases/userRole/RemoveAllUserRolesUseCase";
import { RemoveRoleUseCase } from "@/application/use-cases/userRole/RemoveRoleUseCase";
import { UserRoleController } from "@/presentation/controllers/UserRoleController";
import { PrismaRoleRepository } from "../repositories/PrismaRoleRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PrismaUserRoleRepository } from "../repositories/PrismaUserRoleRepository";

export class UserRoleModule {
  private static userRoleRepository: PrismaUserRoleRepository;
  private static userRepository: PrismaUserRepository;
  private static roleRepository: PrismaRoleRepository;
  private static userRoleController: UserRoleController;

  static getUserRoleRepository() {
    if (!this.userRoleRepository) {
      this.userRoleRepository = new PrismaUserRoleRepository();
    }
    return this.userRoleRepository;
  }

  private static getUserRepository() {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository();
    }
    return this.userRepository;
  }

  private static getRoleRepository() {
    if (!this.roleRepository) {
      this.roleRepository = new PrismaRoleRepository();
    }
    return this.roleRepository;
  }

  static getUserRoleController() {
    if (!this.userRoleController) {
      const userRoleRepo = this.getUserRoleRepository();
      const userRepo = this.getUserRepository();
      const roleRepo = this.getRoleRepository();

      const assignRoleUseCase = new AssignRoleUseCase(
        userRoleRepo,
        userRepo,
        roleRepo,
      );
      const removeRoleUseCase = new RemoveRoleUseCase(userRoleRepo);
      const getUserRolesUseCase = new GetUserRolesUseCase(userRoleRepo);
      const getUsersByRoleUseCase = new GetUsersByRoleUseCase(userRoleRepo);
      const removeAllUserRolesUseCase = new RemoveAllUserRolesUseCase(
        userRoleRepo,
      );
      const getAllUserRolesUseCase = new GetAllUserRolesUseCase(userRoleRepo);

      this.userRoleController = new UserRoleController(
        assignRoleUseCase,
        removeRoleUseCase,
        getUserRolesUseCase,
        getUsersByRoleUseCase,
        removeAllUserRolesUseCase,
        getAllUserRolesUseCase,
      );
    }
    return this.userRoleController;
  }
}
