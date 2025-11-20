import { CreateUserUseCase } from "@/application/use-cases/user/CreateUserUseCase";
import { DeleteUserUseCase } from "@/application/use-cases/user/DeleteUserUseCase";
import { GetAllUsersUseCase } from "@/application/use-cases/user/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "@/application/use-cases/user/GetUserByIdUseCase";
import { UpdateUserUseCase } from "@/application/use-cases/user/UpdateUserUseCase";
import { UserController } from "@/presentation/controllers/UserController";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { BcryptPasswordHasher } from "@/infrastructure/services/BcryptPasswordHasher";

export class UserModule {
  private static userRepository: PrismaUserRepository;
  private static passwordHasher: BcryptPasswordHasher;
  private static userController: UserController;

  static getUserRepository(): PrismaUserRepository {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository();
    }
    return this.userRepository;
  }

  static getPasswordHasher(): BcryptPasswordHasher {
    if (!this.passwordHasher) {
      this.passwordHasher = new BcryptPasswordHasher();
    }
    return this.passwordHasher;
  }

  static getUserController(): UserController {
    if (!this.userController) {
      const userRepository = this.getUserRepository();
      const passwordHasher = this.getPasswordHasher();

      const createUserUseCase = new CreateUserUseCase(
        userRepository,
        passwordHasher,
      );
      const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
      const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
      const updateUserUseCase = new UpdateUserUseCase(
        userRepository,
        passwordHasher,
      );
      const deleteUserUseCase = new DeleteUserUseCase(userRepository);

      this.userController = new UserController(
        createUserUseCase,
        getAllUsersUseCase,
        getUserByIdUseCase,
        updateUserUseCase,
        deleteUserUseCase,
      );
    }
    return this.userController;
  }
}
