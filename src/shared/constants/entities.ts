export const ENTITY_NAMES = {
  USER: "User",
  ROLE: "Role",
  REFRESH_TOKEN: "RefreshToken",
  USER_ROLE: "UserRole",
} as const;

export type EntityName = (typeof ENTITY_NAMES)[keyof typeof ENTITY_NAMES];
