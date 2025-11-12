import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const limit = Number(process.env.COMMON_RATE_LIMIT_MAX_REQUESTS) || 100;
const windowMs =
  Number(process.env.COMMON_RATE_LIMIT_WINDOW_MS) * 15 * 60 * 1000 ||
  15 * 60 * 1000;

const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: limit,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: windowMs,
  keyGenerator: (req: Request) => {
    return ipKeyGenerator(req.ip || "unknown");
  },
});

export default rateLimiter;
