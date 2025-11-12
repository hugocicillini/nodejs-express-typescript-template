import express, { type Request, type Response, type Router } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPIDocument } from "./swaggerGenerator";

export const openAPIRouter: Router = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/swagger.json", (_req: Request, res: Response) => {
  res.json(openAPIDocument);
});

openAPIRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(openAPIDocument, {
    swaggerOptions: {
      // docExpansion: "none",
      defaultModelsExpandDepth: -1,
    },
  }),
);
