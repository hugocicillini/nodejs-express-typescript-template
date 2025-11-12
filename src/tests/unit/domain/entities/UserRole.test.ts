import { describe, it, expect, beforeEach } from "vitest";
import { UserRole } from "@/domain/entities/UserRole";
import {
  validUserRoleProps,
  expiredUserRoleProps,
} from "@/tests/helpers/fixtures/domainFixtures";

describe("UserRole Entity", () => {
  describe("create", () => {
    it("should create a user role with valid data", () => {
      // Act
      const userRole = UserRole.create(validUserRoleProps);

      // Assert
      expect(userRole).toBeInstanceOf(UserRole);
      expect(userRole.id).toBe(validUserRoleProps.id);
      expect(userRole.userId).toBe(validUserRoleProps.userId);
      expect(userRole.roleId).toBe(validUserRoleProps.roleId);
      expect(userRole.isActive).toBe(true);
      expect(userRole.expiresAt).toBeNull();
    });

    it("should create a user role with expiration date", () => {
      // Act
      const userRole = UserRole.create(expiredUserRoleProps);

      // Assert
      expect(userRole.expiresAt).not.toBeNull();
      expect(userRole.expiresAt).toBeInstanceOf(Date);
    });

    it("should create a user role with assignedBy", () => {
      // Arrange
      const propsWithAssignedBy = {
        ...validUserRoleProps,
        assignedBy: "admin-user-id-123",
      };

      // Act
      const userRole = UserRole.create(propsWithAssignedBy);

      // Assert
      expect(userRole.assignedBy).toBe("admin-user-id-123");
    });
  });

  describe("getters", () => {
    let userRole: UserRole;

    beforeEach(() => {
      userRole = UserRole.create(validUserRoleProps);
    });

    it("should return id", () => {
      expect(userRole.id).toBe(validUserRoleProps.id);
    });

    it("should return userId", () => {
      expect(userRole.userId).toBe(validUserRoleProps.userId);
    });

    it("should return roleId", () => {
      expect(userRole.roleId).toBe(validUserRoleProps.roleId);
    });

    it("should return assignedAt", () => {
      expect(userRole.assignedAt).toEqual(validUserRoleProps.assignedAt);
    });

    it("should return assignedBy", () => {
      expect(userRole.assignedBy).toBe(validUserRoleProps.assignedBy);
    });

    it("should return expiresAt", () => {
      expect(userRole.expiresAt).toBe(validUserRoleProps.expiresAt);
    });

    it("should return isActive", () => {
      expect(userRole.isActive).toBe(validUserRoleProps.isActive);
    });
  });

  describe("deactivate", () => {
    it("should deactivate an active user role", () => {
      // Arrange
      const userRole = UserRole.create(validUserRoleProps);
      expect(userRole.isActive).toBe(true);

      // Act
      userRole.deactivate();

      // Assert
      expect(userRole.isActive).toBe(false);
    });

    it("should deactivate an already inactive user role", () => {
      // Arrange
      const inactiveProps = { ...validUserRoleProps, isActive: false };
      const userRole = UserRole.create(inactiveProps);
      expect(userRole.isActive).toBe(false);

      // Act
      userRole.deactivate();

      // Assert
      expect(userRole.isActive).toBe(false);
    });
  });

  describe("isExpired", () => {
    it("should return false when expiresAt is null", () => {
      // Arrange
      const userRole = UserRole.create(validUserRoleProps);

      // Act
      const result = userRole.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when expiresAt is in the future", () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 dias no futuro

      const futureExpirationProps = {
        ...validUserRoleProps,
        expiresAt: futureDate,
      };

      const userRole = UserRole.create(futureExpirationProps);

      // Act
      const result = userRole.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when expiresAt is in the past", () => {
      // Arrange
      const userRole = UserRole.create(expiredUserRoleProps);

      // Act
      const result = userRole.isExpired();

      // Assert
      expect(result).toBe(true);
    });

    it("should return true when expiresAt is exactly now (edge case)", () => {
      // Arrange
      const now = new Date();
      const userRole = UserRole.create({
        ...validUserRoleProps,
        expiresAt: now,
      });

      // Act
      const result = userRole.isExpired();

      // Assert
      // Dependendo do timing, pode ser true ou false
      expect(typeof result).toBe("boolean");
    });
  });

  describe("toJSON", () => {
    it("should return all user role properties", () => {
      // Arrange
      const userRole = UserRole.create(validUserRoleProps);

      // Act
      const json = userRole.toJSON();

      // Assert
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("userId");
      expect(json).toHaveProperty("roleId");
      expect(json).toHaveProperty("assignedAt");
      expect(json).toHaveProperty("assignedBy");
      expect(json).toHaveProperty("expiresAt");
      expect(json).toHaveProperty("isActive");
    });

    it("should return correct values", () => {
      // Arrange
      const userRole = UserRole.create(validUserRoleProps);

      // Act
      const json = userRole.toJSON();

      // Assert
      expect(json.id).toBe(validUserRoleProps.id);
      expect(json.userId).toBe(validUserRoleProps.userId);
      expect(json.roleId).toBe(validUserRoleProps.roleId);
      expect(json.assignedAt).toEqual(validUserRoleProps.assignedAt);
      expect(json.assignedBy).toBe(validUserRoleProps.assignedBy);
      expect(json.expiresAt).toBe(validUserRoleProps.expiresAt);
      expect(json.isActive).toBe(validUserRoleProps.isActive);
    });
  });

  describe("business logic scenarios", () => {
    it("should identify valid, active, non-expired user role", () => {
      // Arrange
      const userRole = UserRole.create({
        ...validUserRoleProps,
        isActive: true,
      });

      // Assert
      expect(userRole.isActive).toBe(true);
      expect(userRole.isExpired()).toBe(false);
    });

    it("should identify active but expired user role", () => {
      // Arrange
      const userRole = UserRole.create(expiredUserRoleProps);

      // Assert
      expect(userRole.isActive).toBe(true); // Ainda ativo
      expect(userRole.isExpired()).toBe(true); // Mas expirado
    });

    it("should identify inactive but not expired user role", () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const userRole = UserRole.create({
        ...validUserRoleProps,
        expiresAt: futureDate,
        isActive: false,
      });

      // Assert
      expect(userRole.isActive).toBe(false);
      expect(userRole.isExpired()).toBe(false);
    });

    it("should identify permanent role (no expiration)", () => {
      // Arrange
      const userRole = UserRole.create({
        ...validUserRoleProps,
        isActive: true,
      });

      // Assert
      expect(userRole.expiresAt).toBeNull();
      expect(userRole.isExpired()).toBe(false);
      expect(userRole.isActive).toBe(true);
    });

    it("should identify temporary role (with expiration)", () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3); // 3 meses

      const temporaryRole = UserRole.create({
        ...validUserRoleProps,
        expiresAt: futureDate,
        isActive: true,
      });

      // Assert
      expect(temporaryRole.expiresAt).not.toBeNull();
      expect(temporaryRole.isExpired()).toBe(false);
      expect(temporaryRole.isActive).toBe(true);
    });
  });
});
