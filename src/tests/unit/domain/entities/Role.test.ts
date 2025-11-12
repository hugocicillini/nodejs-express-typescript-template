import { describe, it, expect, beforeEach } from "vitest";
import { Role } from "@/domain/entities/Role";
import { RoleName } from "@/domain/value-objects/RoleName";
import {
  adminRoleProps,
  userRoleProps,
  inactiveRoleProps,
} from "@/tests/helpers/fixtures/domainFixtures";

describe("Role Entity", () => {
  describe("create", () => {
    it("should create a role with valid data", () => {
      // Act
      const role = Role.create(adminRoleProps);

      // Assert
      expect(role).toBeInstanceOf(Role);
      expect(role.id).toBe(adminRoleProps.id);
      expect(role.name).toBe(RoleName.ADMIN);
      expect(role.description).toBe(adminRoleProps.description);
      expect(role.isActive).toBe(true);
      expect(role.deletedAt).toBeNull();
    });

    it("should create an inactive role", () => {
      // Act
      const role = Role.create(inactiveRoleProps);

      // Assert
      expect(role.isActive).toBe(false);
      expect(role.deletedAt).not.toBeNull();
    });

    it("should create role with null description", () => {
      // Arrange
      const roleWithoutDescription = {
        ...userRoleProps,
        description: null,
      };

      // Act
      const role = Role.create(roleWithoutDescription);

      // Assert
      expect(role.description).toBeNull();
    });
  });

  describe("getters", () => {
    let role: Role;

    beforeEach(() => {
      role = Role.create(adminRoleProps);
    });

    it("should return id", () => {
      expect(role.id).toBe(adminRoleProps.id);
    });

    it("should return name as RoleName enum", () => {
      expect(role.name).toBe(RoleName.ADMIN);
      expect(Object.values(RoleName)).toContain(role.name);
    });

    it("should return description", () => {
      expect(role.description).toBe(adminRoleProps.description);
    });

    it("should return isActive", () => {
      expect(role.isActive).toBe(adminRoleProps.isActive);
    });

    it("should return createdAt", () => {
      expect(role.createdAt).toEqual(adminRoleProps.createdAt);
    });

    it("should return updatedAt", () => {
      expect(role.updatedAt).toEqual(adminRoleProps.updatedAt);
    });

    it("should return deletedAt", () => {
      expect(role.deletedAt).toBe(adminRoleProps.deletedAt);
    });
  });

  describe("deactivate", () => {
    it("should deactivate an active role", () => {
      // Arrange
      const role = Role.create(adminRoleProps);
      expect(role.isActive).toBe(true);
      expect(role.deletedAt).toBeNull();

      // Act
      role.deactivate();

      // Assert
      expect(role.isActive).toBe(false);
      expect(role.deletedAt).not.toBeNull();
      expect(role.deletedAt).toBeInstanceOf(Date);
    });

    it("should set deletedAt to current date", () => {
      // Arrange
      const role = Role.create(adminRoleProps);
      const beforeDeactivate = new Date();

      // Act
      role.deactivate();

      // Assert
      const afterDeactivate = new Date();
      expect(role.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDeactivate.getTime(),
      );
      expect(role.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterDeactivate.getTime(),
      );
    });
  });

  describe("activate", () => {
    it("should activate an inactive role", () => {
      // Arrange
      const role = Role.create(inactiveRoleProps);
      expect(role.isActive).toBe(false);
      expect(role.deletedAt).not.toBeNull();

      // Act
      role.activate();

      // Assert
      expect(role.isActive).toBe(true);
      expect(role.deletedAt).toBeNull();
    });

    it("should update updatedAt timestamp", () => {
      // Arrange
      const role = Role.create(inactiveRoleProps);
      const originalUpdatedAt = role.updatedAt.getTime();

      // Wait 1ms to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Busy wait
      }

      // Act
      role.activate();

      // Assert
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("updateName", () => {
    it("should update role name", () => {
      // Arrange
      const role = Role.create(userRoleProps);
      const newName = RoleName.ADMIN;

      // Act
      role.updateName(newName);

      // Assert
      expect(role.name).toBe(RoleName.ADMIN);
    });

    it("should update updatedAt timestamp", () => {
      // Arrange
      const role = Role.create(userRoleProps);
      const originalUpdatedAt = role.updatedAt.getTime();

      // Wait 1ms to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Busy wait
      }

      // Act
      role.updateName(RoleName.SUPER_ADMIN);

      // Assert
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("updateDescription", () => {
    it("should update role description", () => {
      // Arrange
      const role = Role.create(adminRoleProps);
      const newDescription = "Updated admin description";

      // Act
      role.updateDescription(newDescription);

      // Assert
      expect(role.description).toBe(newDescription);
    });

    it("should set description to null", () => {
      // Arrange
      const role = Role.create(adminRoleProps);

      // Act
      role.updateDescription(null);

      // Assert
      expect(role.description).toBeNull();
    });

    it("should update updatedAt timestamp", () => {
      // Arrange
      const role = Role.create(adminRoleProps);
      const originalUpdatedAt = role.updatedAt.getTime();

      // Wait 1ms to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Busy wait
      }

      // Act
      role.updateDescription("New description");

      // Assert
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("toJSON", () => {
    it("should return all role properties", () => {
      // Arrange
      const role = Role.create(adminRoleProps);

      // Act
      const json = role.toJSON();

      // Assert
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("description");
      expect(json).toHaveProperty("isActive");
      expect(json).toHaveProperty("createdAt");
      expect(json).toHaveProperty("updatedAt");
      expect(json).toHaveProperty("deletedAt");
    });

    it("should return correct values", () => {
      // Arrange
      const role = Role.create(adminRoleProps);

      // Act
      const json = role.toJSON();

      // Assert
      expect(json.id).toBe(adminRoleProps.id);
      expect(json.name).toBe(RoleName.ADMIN);
      expect(json.description).toBe(adminRoleProps.description);
      expect(json.isActive).toBe(adminRoleProps.isActive);
    });
  });
});
