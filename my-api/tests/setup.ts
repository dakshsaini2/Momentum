import { beforeAll, afterAll } from "vitest";

/**
 * Test setup file.
 *
 * Integration tests require a running PostgreSQL database.
 * Set DATABASE_URL in your test environment or use Docker:
 *
 *   docker compose up -d postgres
 *
 * Then run tests:
 *
 *   npm test
 */

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_ACCESS_SECRET =
    "test-access-secret-that-is-at-least-32-chars-long!!";
  process.env.JWT_REFRESH_SECRET =
    "test-refresh-secret-that-is-at-least-32-chars-long!!";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.PORT = "0";
  process.env.CORS_ORIGIN = "*";
  process.env.LOG_LEVEL = "silent";
});

afterAll(async () => {
  // Cleanup resources if needed
});
