import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { AccountLockedError, InvalidCredentialsError } from "../src/errors/authErrors.js";
import type { AuthService } from "../src/auth/auth.service.js";
import { createApp } from "../src/index.js";
import { resetRateLimitStateForTests } from "../src/middleware/rateLimitLogin.js";

const fakeUser = {
  id: "u1",
  email: "doctor@clinic.com",
  displayName: "Dr. Smith",
  role: "DOCTOR" as const
};

function buildApp() {
  const authService: AuthService = {
    async login(input) {
      if (input.password === "CorrectPassword123") {
        return {
          accessToken: "jwt-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: fakeUser
        };
      }

      if (input.password === "LockedPassword123") {
        throw new AccountLockedError();
      }

      throw new InvalidCredentialsError();
    },
    async getMe() {
      return fakeUser;
    }
  };

  return createApp({
    env: {
      serverPort: 4000,
      databaseUrl: "postgres://local/test",
      jwtSecret: "test-secret",
      jwtExpiresInSec: 3600,
      loginRateLimitWindowSec: 60,
      loginRateLimitMaxAttempts: 2,
      accountLockMinutes: 5
    },
    authService
  });
}

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
  });

  it("returns token payload for valid credentials", async () => {
    const app = buildApp();

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "CorrectPassword123"
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe("jwt-token");
    expect(response.body.user.email).toBe("doctor@clinic.com");
  });

  it("returns generic auth error for invalid credentials", async () => {
    const app = buildApp();

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "WrongPassword123"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
    expect(response.body.error.message).toBe("Invalid credentials");
  });

  it("returns 429 when login attempts exceed policy threshold", async () => {
    const app = buildApp();

    await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "WrongPassword123"
    });
    await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "WrongPassword123"
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "WrongPassword123"
    });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe("AUTH_RATE_LIMITED");
  });
});
