import { RoleName } from "@/domain/value-objects/RoleName";
import { describe, expect, it } from "vitest";

describe("RoleName Value Object", () => {
  describe("enum values", () => {
    it("should have SUPER_ADMIN value", () => {
      expect(RoleName.SUPER_ADMIN).toBe("SUPER_ADMIN");
    });

    it("should have ADMIN value", () => {
      expect(RoleName.ADMIN).toBe("ADMIN");
    });

    it("should have USER value", () => {
      expect(RoleName.USER).toBe("USER");
    });
  });

  describe("enum validation", () => {
    it("should contain exactly 3 roles", () => {
      const values = Object.values(RoleName);
      expect(values).toHaveLength(3);
    });

    it("should have all expected role names", () => {
      const values = Object.values(RoleName);
      expect(values).toContain("SUPER_ADMIN");
      expect(values).toContain("ADMIN");
      expect(values).toContain("USER");
    });

    it("should be type-safe (TypeScript check)", () => {
      // Arrange
      const role: RoleName = RoleName.ADMIN;

      // Assert
      expect(role).toBe("ADMIN");
      expect(Object.values(RoleName)).toContain(role);
    });
  });

  describe("usage in comparisons", () => {
    it("should allow equality comparison", () => {
      expect(RoleName.ADMIN).toBe(RoleName.ADMIN);
      expect(RoleName.USER).not.toBe(RoleName.ADMIN);
    });

    function getRoleString(role: RoleName): string {
      switch (role) {
        case RoleName.SUPER_ADMIN:
          return "super_admin";
        case RoleName.ADMIN:
          return "admin";
        case RoleName.USER:
          return "user";
        default: {
          const exhaustiveCheck: never = role;
          throw new Error(`Unhandled role: ${exhaustiveCheck}`);
        }
      }
    }

    it("should map ADMIN role correctly", () => {
      const result = getRoleString(RoleName.ADMIN);
      expect(result).toBe("admin");
    });

    it("should map SUPER_ADMIN role correctly", () => {
      const result = getRoleString(RoleName.SUPER_ADMIN);
      expect(result).toBe("super_admin");
    });

    it("should map USER role correctly", () => {
      const result = getRoleString(RoleName.USER);
      expect(result).toBe("user");
    });
  });

  describe("string validation", () => {
    it("should validate if string is valid RoleName", () => {
      const isValidRole = (value: string): value is RoleName => {
        return Object.values(RoleName).includes(value as RoleName);
      };

      expect(isValidRole("ADMIN")).toBe(true);
      expect(isValidRole("USER")).toBe(true);
      expect(isValidRole("SUPER_ADMIN")).toBe(true);
      expect(isValidRole("INVALID")).toBe(false);
      expect(isValidRole("admin")).toBe(false); // Case sensitive
    });
  });

  describe("hierarchy representation (business logic)", () => {
    it("should define role hierarchy levels", () => {
      const getRoleLevel = (role: RoleName): number => {
        const hierarchy = {
          [RoleName.SUPER_ADMIN]: 3,
          [RoleName.ADMIN]: 2,
          [RoleName.USER]: 1,
        };
        return hierarchy[role];
      };

      expect(getRoleLevel(RoleName.SUPER_ADMIN)).toBeGreaterThan(
        getRoleLevel(RoleName.ADMIN),
      );
      expect(getRoleLevel(RoleName.ADMIN)).toBeGreaterThan(
        getRoleLevel(RoleName.USER),
      );
    });

    it("should check if role has higher privileges", () => {
      const hasHigherPrivilege = (
        roleA: RoleName,
        roleB: RoleName,
      ): boolean => {
        const levels = {
          [RoleName.SUPER_ADMIN]: 3,
          [RoleName.ADMIN]: 2,
          [RoleName.USER]: 1,
        };
        return levels[roleA] > levels[roleB];
      };

      expect(hasHigherPrivilege(RoleName.SUPER_ADMIN, RoleName.ADMIN)).toBe(
        true,
      );
      expect(hasHigherPrivilege(RoleName.ADMIN, RoleName.USER)).toBe(true);
      expect(hasHigherPrivilege(RoleName.USER, RoleName.ADMIN)).toBe(false);
    });
  });

  describe("immutability", () => {
    it("should maintain const variable immutability", () => {
      // const variables cannot be reassigned (TypeScript compile-time check)
      const role = RoleName.ADMIN;

      // This documents that the value is correctly assigned and type-safe
      expect(role).toBe("ADMIN");
      expect(Object.values(RoleName)).toContain(role);
    });

    it("should have stable enum values", () => {
      // Enum values remain consistent throughout the application lifecycle
      const adminRole1 = RoleName.ADMIN;
      const adminRole2 = RoleName.ADMIN;

      expect(adminRole1).toBe(adminRole2);
      expect(adminRole1).toBe("ADMIN");
    });
  });
});
