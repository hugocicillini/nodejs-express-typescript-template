import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const LogoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});
