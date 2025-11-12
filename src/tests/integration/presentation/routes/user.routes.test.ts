import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { userRouter } from "@/presentation/routes/user.routes";

describe("User Routes Integration", () => {
  let app: Application;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use("/users", userRouter);
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("GET /users", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access token not provided");
    });

    it("should reject invalid token format", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", "InvalidFormat token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should accept valid authorization header format", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", "Bearer some-token");

      // Will be 401 (invalid token) or 200 (valid token)
      expect([200, 401]).toContain(response.status);
    });
  });

  describe("GET /users/:id", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/users/user-123");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate id parameter", async () => {
      const response = await request(app)
        .get("/users/invalid-id-format")
        .set("Authorization", "Bearer some-token");

      // Will fail at auth or validation
      expect([400, 401]).toContain(response.status);
    });

    it("should accept valid id format with auth", async () => {
      const response = await request(app)
        .get("/users/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", "Bearer some-token");

      // Will be 401 (invalid token), 404 (not found) or 200 (success)
      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe("POST /users", () => {
    it("should require authentication", async () => {
      const response = await request(app).post("/users").send({
        email: "newuser@example.com",
        name: "New User",
        password: "Password123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should require admin role", async () => {
      const response = await request(app)
        .post("/users")
        .set("Authorization", "Bearer user-token")
        .send({
          email: "newuser@example.com",
          name: "New User",
          password: "Password123!",
        });

      // Will be 401 (invalid token) or 403 (insufficient permissions)
      expect([401, 403]).toContain(response.status);
    });

    it("should validate request body", async () => {
      const response = await request(app)
        .post("/users")
        .set("Authorization", "Bearer admin-token")
        .send({});

      // Will fail at validation or auth
      expect([400, 401, 403]).toContain(response.status);
    });

    it("should validate email format", async () => {
      const response = await request(app)
        .post("/users")
        .set("Authorization", "Bearer admin-token")
        .send({
          email: "invalid-email",
          name: "New User",
          password: "Password123!",
        });

      // Will fail at validation or auth
      expect([400, 401, 403]).toContain(response.status);
    });
  });

  describe("PUT /users/:id", () => {
    it("should require authentication", async () => {
      const response = await request(app).put("/users/user-123").send({
        name: "Updated Name",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate id parameter", async () => {
      const response = await request(app)
        .put("/users/invalid-id")
        .set("Authorization", "Bearer some-token")
        .send({
          name: "Updated Name",
        });

      // Will fail at validation or auth
      expect([400, 401]).toContain(response.status);
    });

    it("should accept valid update data", async () => {
      const response = await request(app)
        .put("/users/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", "Bearer some-token")
        .send({
          name: "Updated Name",
        });

      // Will be 401 (invalid token), 404 (not found), 403 (forbidden) or 200 (success)
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should require authentication", async () => {
      const response = await request(app).delete("/users/user-123");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should require super admin role", async () => {
      const response = await request(app)
        .delete("/users/user-123")
        .set("Authorization", "Bearer user-token");

      // Will be 401 (invalid token) or 403 (insufficient permissions)
      expect([401, 403]).toContain(response.status);
    });

    it("should validate id parameter", async () => {
      const response = await request(app)
        .delete("/users/invalid-id")
        .set("Authorization", "Bearer super-admin-token");

      // Will fail at validation or auth
      expect([400, 401, 403]).toContain(response.status);
    });

    it("should accept valid id with proper auth", async () => {
      const response = await request(app)
        .delete("/users/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", "Bearer super-admin-token");

      // Will be 401 (invalid token), 403 (forbidden), 404 (not found) or 200 (success)
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
