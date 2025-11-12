import { ServiceResponse } from "@/application/models/serviceResponse";
import type { Request, Response } from "express";

export class HealthCheckController {
  public async check(_req: Request, res: Response): Promise<void> {
    const serviceResponse = ServiceResponse.success("Service is healthy", null);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}
