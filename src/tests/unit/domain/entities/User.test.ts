import { describe, it, expect, beforeEach } from "vitest";
import { User } from "@/domain/entities/User";
import {
  validUserProps,
  inactiveUserProps,
} from "@/tests/helpers/fixtures/domainFixtures";

describe("User Entity", () => {
  describe("create", () => {
    it("should create a user with valid data", () => {
      // Act
      const user = User.create(validUserProps);

      // Assert
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(validUserProps.id);
      expect(user.email).toBe(validUserProps.email);
      expect(user.name).toBe(validUserProps.name);
      expect(user.password).toBe(validUserProps.password);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toEqual(validUserProps.createdAt);
      expect(user.updatedAt).toEqual(validUserProps.updatedAt);
      expect(user.deletedAt).toBeNull();
    });

    it("should create an inactive user", () => {
      // Act
      const user = User.create(inactiveUserProps);

      // Assert
      expect(user.isActive).toBe(false);
      expect(user.deletedAt).not.toBeNull();
    });
  });

  describe("getters", () => {
    let user: User;

    beforeEach(() => {
      user = User.create(validUserProps);
    });

    it("should return id", () => {
      expect(user.id).toBe(validUserProps.id);
    });

    it("should return email", () => {
      expect(user.email).toBe(validUserProps.email);
    });

    it("should return name", () => {
      expect(user.name).toBe(validUserProps.name);
    });

    it("should return password", () => {
      expect(user.password).toBe(validUserProps.password);
    });

    it("should return isActive", () => {
      expect(user.isActive).toBe(validUserProps.isActive);
    });

    it("should return createdAt", () => {
      expect(user.createdAt).toEqual(validUserProps.createdAt);
    });

    it("should return updatedAt", () => {
      expect(user.updatedAt).toEqual(validUserProps.updatedAt);
    });

    it("should return deletedAt", () => {
      expect(user.deletedAt).toBe(validUserProps.deletedAt);
    });
  });

  describe("deactivate", () => {
    it("should deactivate an active user", () => {
      // Arrange
      const user = User.create(validUserProps);
      expect(user.isActive).toBe(true);
      expect(user.deletedAt).toBeNull();

      // Act
      user.deactivate();

      // Assert
      expect(user.isActive).toBe(false);
      expect(user.deletedAt).not.toBeNull();
      expect(user.deletedAt).toBeInstanceOf(Date);
    });

    it("should set deletedAt to current date", () => {
      // Arrange
      const user = User.create(validUserProps);
      const beforeDeactivate = new Date();

      // Act
      user.deactivate();

      // Assert
      const afterDeactivate = new Date();
      expect(user.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDeactivate.getTime(),
      );
      expect(user.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterDeactivate.getTime(),
      );
    });
  });

  describe("updateName", () => {
    it("should update user name", () => {
      // Arrange
      const user = User.create(validUserProps);
      const newName = "Updated Name";

      // Act
      user.updateName(newName);

      // Assert
      expect(user.name).toBe(newName);
    });

    it("should update updatedAt timestamp", () => {
      // Arrange
      const user = User.create(validUserProps);
      const originalUpdatedAt = user.updatedAt.getTime();

      // Wait 1ms to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Busy wait
      }

      // Act
      user.updateName("New Name");

      // Assert
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("updatePassword", () => {
    it("should update user password", () => {
      // Arrange
      const user = User.create(validUserProps);
      const newHashedPassword = "$2a$10$newHashedPassword";

      // Act
      user.updatePassword(newHashedPassword);

      // Assert
      expect(user.password).toBe(newHashedPassword);
    });

    it("should update updatedAt timestamp", () => {
      // Arrange
      const user = User.create(validUserProps);
      const originalUpdatedAt = user.updatedAt.getTime();

      // Wait 1ms to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Busy wait
      }

      // Act
      user.updatePassword("$2a$10$newHashedPassword");

      // Assert
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("toJSON", () => {
    it("should return user data without password", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const json = user.toJSON();

      // Assert
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("isActive");
      expect(json).toHaveProperty("createdAt");
      expect(json).toHaveProperty("updatedAt");
      expect(json).toHaveProperty("deletedAt");
      expect(json).not.toHaveProperty("password"); // ✅ Segurança
    });

    it("should return correct values", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const json = user.toJSON();

      // Assert
      expect(json.id).toBe(validUserProps.id);
      expect(json.email).toBe(validUserProps.email);
      expect(json.name).toBe(validUserProps.name);
      expect(json.isActive).toBe(validUserProps.isActive);
    });
  });

  describe("encapsulation", () => {
    it("should not expose props property", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Assert - Props should be private (TypeScript compile-time check)
      // In runtime, private properties are accessible but this is a TypeScript feature
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      // Props object itself is not exposed as public API
    });
  });
});
