import type { UserProps } from "@/domain/entities/User";
import type { RoleProps } from "@/domain/entities/Role";
import type { UserRoleProps } from "@/domain/entities/UserRole";
import type { RefreshTokenProps } from "@/domain/entities/RefreshToken";
import { RoleName } from "@/domain/value-objects/RoleName";

// ========================================
// USER FIXTURES
// ========================================

export const validUserProps: UserProps = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  name: "Test User",
  password: "$2a$10$hashedPasswordExample123456789",
  isActive: true,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  deletedAt: null,
};

export const inactiveUserProps: UserProps = {
  ...validUserProps,
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "inactive@example.com",
  isActive: false,
  deletedAt: new Date("2024-01-15T10:00:00Z"),
};

// ========================================
// ROLE FIXTURES
// ========================================

export const adminRoleProps: RoleProps = {
  id: "660e8400-e29b-41d4-a716-446655440000",
  name: RoleName.ADMIN,
  description: "Administrator role",
  isActive: true,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  deletedAt: null,
};

export const userRoleProps: RoleProps = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  name: RoleName.USER,
  description: "Regular user role",
  isActive: true,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  deletedAt: null,
};

export const inactiveRoleProps: RoleProps = {
  ...adminRoleProps,
  id: "660e8400-e29b-41d4-a716-446655440002",
  name: RoleName.SUPER_ADMIN,
  isActive: false,
  deletedAt: new Date("2024-01-15T10:00:00Z"),
};

// ========================================
// USER ROLE FIXTURES
// ========================================

export const validUserRoleProps: UserRoleProps = {
  id: "770e8400-e29b-41d4-a716-446655440000",
  userId: validUserProps.id,
  roleId: userRoleProps.id,
  assignedAt: new Date("2024-01-01T10:00:00Z"),
  assignedBy: null,
  expiresAt: null,
  isActive: true,
};

export const expiredUserRoleProps: UserRoleProps = {
  ...validUserRoleProps,
  id: "770e8400-e29b-41d4-a716-446655440001",
  expiresAt: new Date("2024-01-01T10:00:00Z"), // Passado
};

// ========================================
// REFRESH TOKEN FIXTURES
// ========================================

export const validRefreshTokenProps: RefreshTokenProps = {
  id: "880e8400-e29b-41d4-a716-446655440000",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validToken",
  userId: validUserProps.id,
  expiresAt: new Date("2025-12-31T23:59:59Z"), // Futuro
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  deletedAt: null,
};

export const expiredRefreshTokenProps: RefreshTokenProps = {
  ...validRefreshTokenProps,
  id: "880e8400-e29b-41d4-a716-446655440001",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expiredToken",
  expiresAt: new Date("2024-01-01T10:00:00Z"), // Passado
};

export const revokedRefreshTokenProps: RefreshTokenProps = {
  ...validRefreshTokenProps,
  id: "880e8400-e29b-41d4-a716-446655440002",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.revokedToken",
  deletedAt: new Date("2024-01-15T10:00:00Z"),
};
