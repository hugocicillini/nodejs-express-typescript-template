import { Router, type Request, type Response } from "express";

const healthCheckRouter = Router();

// Temporary - will be replaced with DI container
import { HealthCheckController } from "@/presentation/controllers/HealthCheckController";
const healthCheckController = new HealthCheckController();

// Export the controller method for direct app.get() usage
export const healthCheck = (req: Request, res: Response) => {
  return healthCheckController.check(req, res);
};

healthCheckRouter.get("/", healthCheckController.check);

export { healthCheckRouter };
