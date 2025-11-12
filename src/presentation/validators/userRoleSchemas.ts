import { z } from "zod";

export const GetUserRolesSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const GetUsersByRoleSchema = z.object({
  params: z.object({
    roleId: z.string().uuid(),
  }),
});

export const AssignRoleSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    expiresAt: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
  }),
});

export const RemoveRoleSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
  }),
});

export const RemoveAllUserRolesSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});
