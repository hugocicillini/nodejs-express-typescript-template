import { ServiceResponse } from "@/application/models/serviceResponse";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { logger } from "./requestLogger";

const unexpectedRequest: RequestHandler = (_req, res) => {
  const serviceResponse = ServiceResponse.failure(
    "The requested endpoint does not exist. Please check the URL and try again.",
    null,
    StatusCodes.NOT_FOUND,
  );
  res.status(serviceResponse.statusCode).json(serviceResponse);
};

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  let serviceResponse: ServiceResponse<any>;

  if (err instanceof ZodError) {
    serviceResponse = ServiceResponse.failure(
      "Validation error",
      err.issues,
      StatusCodes.BAD_REQUEST,
    );

    logger.warn(
      {
        requestId: req.headers["x-request-id"],
        method: req.method,
        url: req.originalUrl || req.url,
        issues: err.issues,
      },
      "Validation error",
    );
  } else {
    serviceResponse = ServiceResponse.failure(
      process.env.NODE_ENV === "production"
        ? "Internal server error."
        : err.message,
      process.env.NODE_ENV === "production" ? null : err.stack || null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );

    res.locals.error = err;

    logger.error(
      {
        requestId: req.headers["x-request-id"],
        method: req.method,
        url: req.originalUrl || req.url,
        error: {
          message: err.message,
          stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
        },
      },
      `Request error: ${err.message}`,
    );
  }

  res.status(serviceResponse.statusCode).json(serviceResponse);
};

export default (): [RequestHandler, ErrorRequestHandler] => [
  unexpectedRequest,
  errorHandler,
];
