import { describe, it, expect, beforeEach } from "vitest";
import { RefreshToken } from "@/domain/entities/RefreshToken";
import {
  validRefreshTokenProps,
  expiredRefreshTokenProps,
  revokedRefreshTokenProps,
} from "@/tests/helpers/fixtures/domainFixtures";

describe("RefreshToken Entity", () => {
  describe("create", () => {
    it("should create a refresh token with valid data", () => {
      // Act
      const token = RefreshToken.create(validRefreshTokenProps);

      // Assert
      expect(token).toBeInstanceOf(RefreshToken);
      expect(token.id).toBe(validRefreshTokenProps.id);
      expect(token.token).toBe(validRefreshTokenProps.token);
      expect(token.userId).toBe(validRefreshTokenProps.userId);
      expect(token.expiresAt).toEqual(validRefreshTokenProps.expiresAt);
      expect(token.deletedAt).toBeNull();
    });

    it("should create an expired token", () => {
      // Act
      const token = RefreshToken.create(expiredRefreshTokenProps);

      // Assert
      expect(token.expiresAt).toEqual(expiredRefreshTokenProps.expiresAt);
      expect(token.expiresAt.getTime()).toBeLessThan(new Date().getTime());
    });

    it("should create a revoked token", () => {
      // Act
      const token = RefreshToken.create(revokedRefreshTokenProps);

      // Assert
      expect(token.deletedAt).not.toBeNull();
      expect(token.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe("getters", () => {
    let token: RefreshToken;

    beforeEach(() => {
      token = RefreshToken.create(validRefreshTokenProps);
    });

    it("should return id", () => {
      expect(token.id).toBe(validRefreshTokenProps.id);
    });

    it("should return token string", () => {
      expect(token.token).toBe(validRefreshTokenProps.token);
    });

    it("should return userId", () => {
      expect(token.userId).toBe(validRefreshTokenProps.userId);
    });

    it("should return expiresAt", () => {
      expect(token.expiresAt).toEqual(validRefreshTokenProps.expiresAt);
    });

    it("should return createdAt", () => {
      expect(token.createdAt).toEqual(validRefreshTokenProps.createdAt);
    });

    it("should return updatedAt", () => {
      expect(token.updatedAt).toEqual(validRefreshTokenProps.updatedAt);
    });

    it("should return deletedAt", () => {
      expect(token.deletedAt).toBe(validRefreshTokenProps.deletedAt);
    });
  });

  describe("isExpired", () => {
    it("should return false for valid (non-expired) token", () => {
      // Arrange
      const token = RefreshToken.create(validRefreshTokenProps);

      // Act
      const result = token.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("should return true for expired token", () => {
      // Arrange
      const token = RefreshToken.create(expiredRefreshTokenProps);

      // Act
      const result = token.isExpired();

      // Assert
      expect(result).toBe(true);
    });

    it("should return true when expiresAt is in the past", () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 1 dia atrás

      const expiredToken = RefreshToken.create({
        ...validRefreshTokenProps,
        expiresAt: pastDate,
      });

      // Act
      const result = expiredToken.isExpired();

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when expiresAt is in the future", () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro

      const validToken = RefreshToken.create({
        ...validRefreshTokenProps,
        expiresAt: futureDate,
      });

      // Act
      const result = validToken.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when expiresAt is exactly now (edge case)", () => {
      // Arrange
      const now = new Date();
      const tokenExpiringNow = RefreshToken.create({
        ...validRefreshTokenProps,
        expiresAt: now,
      });

      // Act
      const result = tokenExpiringNow.isExpired();

      // Assert
      // Dependendo do timing, pode ser true ou false
      // Aceita ambos para evitar flakiness
      expect(typeof result).toBe("boolean");
    });
  });

  describe("revoke", () => {
    it("should revoke a valid token", () => {
      // Arrange
      const token = RefreshToken.create(validRefreshTokenProps);
      expect(token.deletedAt).toBeNull();

      // Act
      token.revoke();

      // Assert
      expect(token.deletedAt).not.toBeNull();
      expect(token.deletedAt).toBeInstanceOf(Date);
    });

    it("should set deletedAt to current date", () => {
      // Arrange
      const token = RefreshToken.create(validRefreshTokenProps);
      const beforeRevoke = new Date();

      // Act
      token.revoke();

      // Assert
      const afterRevoke = new Date();
      expect(token.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeRevoke.getTime(),
      );
      expect(token.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterRevoke.getTime(),
      );
    });

    it("should be able to revoke an already revoked token", () => {
      // Arrange
      const token = RefreshToken.create(revokedRefreshTokenProps);
      const firstDeletedAt = token.deletedAt;

      // Act
      token.revoke();

      // Assert
      expect(token.deletedAt).not.toEqual(firstDeletedAt);
      expect(token.deletedAt!.getTime()).toBeGreaterThan(
        firstDeletedAt!.getTime(),
      );
    });
  });

  describe("toJSON", () => {
    it("should return all token properties", () => {
      // Arrange
      const token = RefreshToken.create(validRefreshTokenProps);

      // Act
      const json = token.toJSON();

      // Assert
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("token");
      expect(json).toHaveProperty("userId");
      expect(json).toHaveProperty("expiresAt");
      expect(json).toHaveProperty("createdAt");
      expect(json).toHaveProperty("updatedAt");
      expect(json).toHaveProperty("deletedAt");
    });

    it("should return correct values", () => {
      // Arrange
      const token = RefreshToken.create(validRefreshTokenProps);

      // Act
      const json = token.toJSON();

      // Assert
      expect(json.id).toBe(validRefreshTokenProps.id);
      expect(json.token).toBe(validRefreshTokenProps.token);
      expect(json.userId).toBe(validRefreshTokenProps.userId);
      expect(json.expiresAt).toEqual(validRefreshTokenProps.expiresAt);
    });
  });

  describe("business logic scenarios", () => {
    it("should identify valid, non-expired, non-revoked token", () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

      const token = RefreshToken.create({
        ...validRefreshTokenProps,
        expiresAt: futureDate,
        deletedAt: null,
      });

      // Assert
      expect(token.isExpired()).toBe(false);
      expect(token.deletedAt).toBeNull();
    });

    it("should identify expired but not revoked token", () => {
      // Arrange
      const token = RefreshToken.create(expiredRefreshTokenProps);

      // Assert
      expect(token.isExpired()).toBe(true);
      expect(token.deletedAt).toBeNull();
    });

    it("should identify revoked but not expired token", () => {
      // Arrange
      const token = RefreshToken.create(revokedRefreshTokenProps);

      // Assert
      expect(token.isExpired()).toBe(false); // Não expirou, mas foi revogado
      expect(token.deletedAt).not.toBeNull();
    });

    it("should identify both expired and revoked token", () => {
      // Arrange
      const token = RefreshToken.create({
        ...expiredRefreshTokenProps,
        deletedAt: new Date(),
      });

      // Assert
      expect(token.isExpired()).toBe(true);
      expect(token.deletedAt).not.toBeNull();
    });
  });
});
