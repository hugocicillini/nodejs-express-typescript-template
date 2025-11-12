import { RoleModule } from "./RoleModule";
import { UserModule } from "./UserModule";
import { UserRoleModule } from "./UserRoleModule";
import { AuthModule } from "./AuthModule";

export class DIContainer {
  static getUserController() {
    return UserModule.getUserController();
  }

  static getRoleController() {
    return RoleModule.getRoleController();
  }

  static getUserRoleController() {
    return UserRoleModule.getUserRoleController();
  }

  static getAuthController() {
    return AuthModule.getAuthController();
  }

  static getUserRepository() {
    return UserModule.getUserRepository();
  }

  static getRoleRepository() {
    return RoleModule.getRoleRepository();
  }

  static getUserRoleRepository() {
    return UserRoleModule.getUserRoleRepository();
  }

  static getPasswordHasher() {
    return UserModule.getPasswordHasher();
  }
}

export { RoleModule, UserModule, UserRoleModule, AuthModule };
