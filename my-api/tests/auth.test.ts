import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";

describe("Auth Endpoints", () => {
  const email = `test_${Math.random()}@example.com`;
  const password = "Password123!";
  let refreshToken: string;

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email, password });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined(); // Should not leak password
  });

  it("should fail to register with duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Another", email, password });

    expect(res.status).toBe(409);
  });

  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    refreshToken = res.body.data.refreshToken;
  });

  it("should fail login with incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("should refresh token successfully", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
