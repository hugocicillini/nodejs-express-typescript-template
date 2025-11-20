import { verifyAccessToken } from "@/shared/utils/jwt";
import type { NextFunction, Request, Response } from "express";

// Estende o tipo Request do Express para incluir user
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
  }
}

/**
 * Middleware: Requer autenticação (Bearer Token)
 * Uso: app.get('/users', requireAuth, controller.getUsers)
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token not provided",
        statusCode: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
    };

    next();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid or expired access token";

    return res.status(401).json({
      success: false,
      message,
      statusCode: 401,
    });
  }
};

/**
 * Middleware: Requer role específica
 * Uso: app.post('/users', requireAuth, requireRole(['ADMIN']), controller.create)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        statusCode: 401,
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        requiredRoles: allowedRoles,
        userRoles: userRoles,
        statusCode: 403,
      });
    }

    next();
  };
};

/**
 * Middleware: Autenticação opcional
 * Uso: app.get('/public-data', optionalAuth, controller.getData)
 * Se token presente: adiciona req.user
 * Se token ausente: continua sem req.user
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const payload = verifyAccessToken(token);

      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
      };
    }

    next();
  } catch (_error) {
    // Ignora erro - autenticação é opcional
    next();
  }
};
