// Clean Architecture - Presentation Layer imports
import errorHandler from "@/presentation/middlewares/errorHandler";
import rateLimiter from "@/presentation/middlewares/rateLimiter";
import requestLogger from "@/presentation/middlewares/requestLogger";
import { healthCheck } from "@/presentation/routes/healthCheck.routes";
import { roleRouter } from "@/presentation/routes/role.routes";
import { userRouter } from "@/presentation/routes/user.routes";
import { userRoleRouter } from "@/presentation/routes/userRole.routes";
import { authRouter } from "@/presentation/routes/auth.routes";
import { openAPIRouter } from "./presentation/swagger/swaggerRouter";

// External dependencies
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

const logger = pino({
  name: "server start",
  transport: { target: "pino-pretty" },
});

/**
 * Create and configure Express application
 * @returns Configured Express application
 */
export function createServer(): Express {
  const app: Express = express();

  // Set the application to trust the reverse proxy
  app.set("trust proxy", true);

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(helmet());
  app.use(rateLimiter);
  app.use(requestLogger);

  // Routes
  const apiPrefix = process.env.API_PREFIX || "/api";

  app.get("/", (_req, res) => {
    res.json({
      name: "Node.js Express TypeScript - Clean Architecture",
      version: "1.0.0",
      status: "running",
      architecture: "Clean Architecture + SOLID",
      endpoints: {
        health: `${apiPrefix}/health`,
        docs: "/api-docs",
      },
    });
  });

  // Health Check
  app.get(`${apiPrefix}/health`, healthCheck);

  // Auth Routes
  app.use(`${apiPrefix}/auth`, authRouter);

  // API Routes (Clean Architecture - Protegidas)
  app.use(`${apiPrefix}/users`, userRouter);
  app.use(`${apiPrefix}/roles`, roleRouter);
  app.use(`${apiPrefix}/user-roles`, userRoleRouter);

  // Swagger UI
  app.use("/api-docs", openAPIRouter);

  // Error handlers
  app.use(errorHandler());

  return app;
}

// Create app instance for direct usage
const app = createServer();

export { app, logger };
