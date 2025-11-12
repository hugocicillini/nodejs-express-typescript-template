import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("express-rate-limit", () => ({
  rateLimit: vi.fn((config) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const _key = config.keyGenerator(req);

      // Simulate rate limit behavior
      const requestCount = (req as any).__rateLimitCount || 0;
      (req as any).__rateLimitCount = requestCount + 1;

      if (requestCount >= config.limit) {
        return res.status(429).json({ message: config.message });
      }

      next();
    };
  }),
  ipKeyGenerator: vi.fn((ip: string) => ip),
}));

describe("rateLimiter", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    vi.resetModules();
    mockRequest = {
      ip: "127.0.0.1",
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  it("should allow requests below the rate limit", async () => {
    const { default: rateLimiter } = await import(
      "@/presentation/middlewares/rateLimiter"
    );

    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should use IP address as key generator", async () => {
    const { ipKeyGenerator } = await import("express-rate-limit");
    const { default: rateLimiter } = await import(
      "@/presentation/middlewares/rateLimiter"
    );

    (mockRequest as any).ip = "192.168.1.1";
    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(ipKeyGenerator).toHaveBeenCalledWith("192.168.1.1");
  });

  it("should handle unknown IP address", async () => {
    const { ipKeyGenerator } = await import("express-rate-limit");
    const { default: rateLimiter } = await import(
      "@/presentation/middlewares/rateLimiter"
    );

    (mockRequest as any).ip = undefined;
    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(ipKeyGenerator).toHaveBeenCalledWith("unknown");
  });

  it("should be configured with environment variables or defaults", async () => {
    const { rateLimit } = await import("express-rate-limit");

    await import("@/presentation/middlewares/rateLimiter");

    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        legacyHeaders: true,
        standardHeaders: true,
        message: "Too many requests, please try again later.",
      }),
    );
  });
});
