import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createJwtService } from "../../src/auth/jwt.js";
import type { AuthService } from "../../src/auth/auth.service.js";
import { createApp } from "../../src/index.js";
import { resetRateLimitStateForTests } from "../../src/middleware/rateLimitLogin.js";

/*
  Characterization tests for F1 - Secure Doctor Login

  These tests document the current observable behaviour of the authentication
  endpoints without asserting implementation details. They must pass against
  the current code and will fail if behaviour changes.
*/

const fakeUser = {
  id: "u1",
  email: "doctor@clinic.com",
  displayName: "Dr. Smith",
  role: "DOCTOR" as const
};

function buildAppWithAuthService(authService: AuthService) {
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

describe("F1 Characterization - /api/v1/auth/login", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
  });

  it("happy path: returns token payload for valid credentials", async () => {
    const authService: AuthService = {
      async login() {
        return {
          accessToken: "jwt-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: fakeUser
        };
      },
      async getMe() {
        return fakeUser;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "CorrectPassword123"
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("jwt-token");
    expect(res.body.user.email).toBe("doctor@clinic.com");
  });

  it("invalid credentials: returns 401 with generic auth error", async () => {
    const authService: AuthService = {
      async login() {
        throw new (await import("../../src/errors/authErrors.js")).InvalidCredentialsError();
      },
      async getMe() {
        return null;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "WrongPassword123"
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
    expect(res.body.error.message).toBe("Invalid credentials");
  });

  it("account locked or rate-limited: returns 429 when policy exceeded", async () => {
    const authService: AuthService = {
      async login() {
        // Simulate repeated invalid attempts then account locked behavior
        throw new (await import("../../src/errors/authErrors.js")).AccountLockedError();
      },
      async getMe() {
        return null;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "LockedPassword123"
    });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("AUTH_RATE_LIMITED");
  });

  it("bad request: payload validation rejects malformed input with 400", async () => {
    const authService: AuthService = {
      async login() {
        // Should not be called when validation fails, but provide fallback
        return {
          accessToken: "x",
          tokenType: "Bearer",
          expiresIn: 1,
          user: fakeUser
        };
      },
      async getMe() {
        return null;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "not-an-email",
      password: "short"
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("AUTH_BAD_REQUEST");
  });

  it("internal error: unexpected errors become 500", async () => {
    const authService: AuthService = {
      async login() {
        throw new Error("database down");
      },
      async getMe() {
        return null;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "doctor@clinic.com",
      password: "CorrectPassword123"
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});

describe("F1 Characterization - protected endpoints and /auth/me", () => {
  it("protected route denies access without token (401)", async () => {
    const authService: AuthService = {
      async login() {
        return {
          accessToken: "jwt-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: fakeUser
        };
      },
      async getMe() {
        return fakeUser;
      }
    };

    const app = buildAppWithAuthService(authService);

    const res = await request(app).get("/api/v1/protected/dashboard");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("protected route allows valid token (200)", async () => {
    const authService: AuthService = {
      async login() {
        return {
          accessToken: "jwt-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: fakeUser
        };
      },
      async getMe() {
        return fakeUser;
      }
    };

    const app = buildAppWithAuthService(authService);
    const token = createJwtService("test-secret", 3600).issueToken(fakeUser);

    const res = await request(app)
      .get("/api/v1/protected/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Authorized");
  });

  it("/auth/me returns 401 without token and 200 with token", async () => {
    const authService: AuthService = {
      async login() {
        return {
          accessToken: "jwt-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: fakeUser
        };
      },
      async getMe() {
        return fakeUser;
      }
    };

    const app = buildAppWithAuthService(authService);
    const token = createJwtService("test-secret", 3600).issueToken(fakeUser);

    const res1 = await request(app).get("/api/v1/auth/me");
    expect(res1.status).toBe(401);

    const res2 = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res2.status).toBe(200);
    expect(res2.body.user.email).toBe("doctor@clinic.com");
  });
});
