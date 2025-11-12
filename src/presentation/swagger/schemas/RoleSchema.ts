import { RoleName } from "@/domain/value-objects/RoleName";
import { z } from "zod";

export const RoleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(RoleName),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

export const CreateRoleInputSchema = z.object({
  name: z.enum(RoleName),
  description: z.string().nullable().optional(),
});

export const UpdateRoleInputSchema = z.object({
  name: z.enum(RoleName).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const DeleteRoleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
