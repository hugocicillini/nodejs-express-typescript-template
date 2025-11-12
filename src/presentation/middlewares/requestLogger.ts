import { prisma } from "@/infrastructure/database/prisma";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { randomUUID } from "node:crypto";
import pino from "pino";
import pinoHttp from "pino-http";

// Logger simples - sem hooks complexos
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
}) as any;

const getLogLevel = (status: number): string => {
  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
  if (status >= StatusCodes.BAD_REQUEST) return "warn";
  return "info";
};

const addRequestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const existingId = req.headers["x-request-id"] as string;
  const requestId = existingId || randomUUID();

  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};

// Persistência no banco após a resposta
const persistLogToDb = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    if (process.env.LOG_TO_DB !== "true") return;

    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const statusCode = res.statusCode;

    const level: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" =
      statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";

    const shouldStoreBodies = process.env.LOG_BODY_TO_DB === "true";

    const safeJson = (data: any, maxLen = 2048): any => {
      try {
        const str = typeof data === "string" ? data : JSON.stringify(data);
        return str.length > maxLen
          ? JSON.parse(str.slice(0, maxLen) + '"}')
          : data;
      } catch {
        return undefined;
      }
    };

    void prisma.requestLog
      .create({
        data: {
          requestId: (req.headers["x-request-id"] as string) || "",
          method: req.method,
          url: req.originalUrl || req.url || "",
          path: req.route?.path || null,
          query: Object.keys(req.query).length > 0 ? req.query : undefined,
          statusCode,
          responseTimeMs: Math.round(durationMs),
          ip: req.ip || null,
          userAgent: (req.headers["user-agent"] as string) || null,
          referer: (req.headers["referer"] as string) || null,
          userId: (req as any).user?.id || null,
          level,
          errorMessage: statusCode >= 400 ? res.statusMessage || null : null,
          errorStack:
            statusCode >= 500 ? res.locals?.error?.stack || null : null,
          requestBody: shouldStoreBodies ? safeJson(req.body) : null,
          responseBody: shouldStoreBodies
            ? safeJson(res.locals?.responseBody)
            : null,
        },
      })
      .catch(() => {
        // Nunca quebrar a request por erro de log
      });
  });

  next();
};

const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] as string,
  customLogLevel: (_req, res) => getLogLevel(res.statusCode),
  customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
  customErrorMessage: (_req, res) =>
    `Request failed with status code: ${res.statusCode}`,
  autoLogging: {
    ignore: (req) => {
      const url = req.url || "";
      return (
        /\.(css|js|ico|png|jpg|svg)$/.test(url) || url.includes("swagger-ui")
      );
    },
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
  },
});

const captureResponseBody = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV !== "production") {
    const originalSend = res.send;
    res.send = function (body) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };
  }
  next();
};

export { logger };
export default [addRequestId, captureResponseBody, httpLogger, persistLogToDb];
