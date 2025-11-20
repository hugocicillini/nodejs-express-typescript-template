import { z } from "zod";

export const GetUserRolesSchema = z.object({
  params: z.object({
    userId: z.uuid(),
  }),
});

export const GetUsersByRoleSchema = z.object({
  params: z.object({
    roleId: z.uuid(),
  }),
});

export const AssignRoleSchema = z.object({
  body: z.object({
    userId: z.uuid(),
    roleId: z.uuid(),
    expiresAt: z.iso
      .datetime()
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
  }),
});

export const RemoveRoleSchema = z.object({
  params: z.object({
    userId: z.uuid(),
    roleId: z.uuid(),
  }),
});

export const RemoveAllUserRolesSchema = z.object({
  params: z.object({
    userId: z.uuid(),
  }),
});
