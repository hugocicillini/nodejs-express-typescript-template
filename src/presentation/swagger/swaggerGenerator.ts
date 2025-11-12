import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { roleRegistry } from "./registries/roleRegistry";
import { userRegistry } from "./registries/userRegistry";
import { userRoleRegistry } from "./registries/userRoleRegistry";
import { authRegistry } from "./registries/authRegistry";

export type OpenAPIDocument = ReturnType<
  OpenApiGeneratorV3["generateDocument"]
>;

export function generateOpenAPIDocument(): OpenAPIDocument {
  const registry = new OpenAPIRegistry([
    authRegistry,
    roleRegistry,
    userRegistry,
    userRoleRegistry,
  ]);

  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  const apiPrefix = process.env.API_PREFIX || "/api/v1";

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    servers: [
      {
        url: `${apiBaseUrl}${apiPrefix}`,
      },
    ],
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/api-docs/swagger.json",
    },
  });
}
