import { z } from "zod";

export const GetUserSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const UpdateUserSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
    password: z.string().min(6).optional(),
  }),
});

export const DeleteUserSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
