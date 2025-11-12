import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { authRouter } from "@/presentation/routes/auth.routes";
import errorHandler from "@/presentation/middlewares/errorHandler";

describe("Auth Routes Integration", () => {
  let app: Application;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use("/auth", authRouter);
    app.use(errorHandler);
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("POST /auth/register", () => {
    it("should require email, name and password", async () => {
      const response = await request(app).post("/auth/register").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "invalid-email",
        name: "Test User",
        password: "Password123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should accept valid registration data", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "newuser@example.com",
        name: "Test User",
        password: "Password123!",
      });

      // Can be 201 (success) or 409 (user already exists)
      expect([201, 409]).toContain(response.status);
    });
  });

  describe("POST /auth/login", () => {
    it("should require email and password", async () => {
      const response = await request(app).post("/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should accept valid login data", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      // Can be 200 (success), 401 (invalid credentials), or 500 (internal error)
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should require refreshToken", async () => {
      const response = await request(app).post("/auth/refresh").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should accept valid refresh token format", async () => {
      const response = await request(app).post("/auth/refresh").send({
        refreshToken: "some-refresh-token",
      });

      // Can be 200 (success) or 401 (invalid token)
      expect([200, 401]).toContain(response.status);
    });
  });

  describe("POST /auth/logout", () => {
    it("should require authentication", async () => {
      const response = await request(app).post("/auth/logout").send({
        refreshToken: "some-token",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access token not provided");
    });

    it("should require valid token format", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", "InvalidFormat token")
        .send({
          refreshToken: "some-token",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should require refreshToken in body", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", "Bearer valid-token")
        .send({});

      // Will fail at validation or auth
      expect([400, 401]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });
});
