import { RegisterUseCase } from "@/application/use-cases/auth/RegisterUseCase";
import { LoginUseCase } from "@/application/use-cases/auth/LoginUseCase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/RefreshTokenUseCase";
import { LogoutUseCase } from "@/application/use-cases/auth/LogoutUseCase";
import { AuthController } from "@/presentation/controllers/AuthController";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PrismaRefreshTokenRepository } from "../repositories/PrismaRefreshTokenRepository";
import { PrismaUserRoleRepository } from "../repositories/PrismaUserRoleRepository";
import { BcryptPasswordHasher } from "../services/BcryptPasswordHasher";
import { JwtService } from "../services/JwtService";

export class AuthModule {
  private static userRepository: PrismaUserRepository;
  private static refreshTokenRepository: PrismaRefreshTokenRepository;
  private static userRoleRepository: PrismaUserRoleRepository;
  private static passwordHasher: BcryptPasswordHasher;
  private static jwtService: JwtService;
  private static authController: AuthController;

  private static getUserRepository() {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository();
    }
    return this.userRepository;
  }

  private static getRefreshTokenRepository() {
    if (!this.refreshTokenRepository) {
      this.refreshTokenRepository = new PrismaRefreshTokenRepository();
    }
    return this.refreshTokenRepository;
  }

  private static getUserRoleRepository() {
    if (!this.userRoleRepository) {
      this.userRoleRepository = new PrismaUserRoleRepository();
    }
    return this.userRoleRepository;
  }

  private static getPasswordHasher() {
    if (!this.passwordHasher) {
      this.passwordHasher = new BcryptPasswordHasher();
    }
    return this.passwordHasher;
  }

  private static getJwtService() {
    if (!this.jwtService) {
      this.jwtService = new JwtService();
    }
    return this.jwtService;
  }

  static getAuthController() {
    if (!this.authController) {
      const userRepo = this.getUserRepository();
      const refreshTokenRepo = this.getRefreshTokenRepository();
      const userRoleRepo = this.getUserRoleRepository();
      const passwordHasher = this.getPasswordHasher();
      const jwtService = this.getJwtService();

      const registerUseCase = new RegisterUseCase(
        userRepo,
        refreshTokenRepo,
        userRoleRepo,
        passwordHasher,
        jwtService,
      );

      const loginUseCase = new LoginUseCase(
        userRepo,
        refreshTokenRepo,
        userRoleRepo,
        passwordHasher,
        jwtService,
      );

      const refreshTokenUseCase = new RefreshTokenUseCase(
        userRepo,
        refreshTokenRepo,
        userRoleRepo,
        jwtService,
      );

      const logoutUseCase = new LogoutUseCase(refreshTokenRepo);

      this.authController = new AuthController(
        registerUseCase,
        loginUseCase,
        refreshTokenUseCase,
        logoutUseCase,
      );
    }
    return this.authController;
  }
}
