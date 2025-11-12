import { z } from "zod";

export const UserRoleResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  roleId: z.uuid(),
  assignedAt: z.iso.datetime(),
  assignedBy: z.uuid().nullable(),
  expiresAt: z.iso.datetime().nullable(),
  isActive: z.boolean(),
});

export const AssignRoleInputSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
  expiresAt: z.iso.datetime().optional().nullable(),
});

export const RemoveRoleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const RemoveAllUserRolesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  count: z.number(),
});
