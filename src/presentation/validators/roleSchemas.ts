import { RoleName } from "@/domain/value-objects/RoleName";
import { z } from "zod";

export const GetRoleSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const CreateRoleSchema = z.object({
  body: z.object({
    name: z.enum(RoleName),
    description: z.string().nullable(),
  }),
});

export const UpdateRoleSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    name: z.enum(RoleName).optional(),
    description: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const DeleteRoleSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
