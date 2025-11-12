import { z } from "zod";

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutInputSchema = z.object({
  refreshToken: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
