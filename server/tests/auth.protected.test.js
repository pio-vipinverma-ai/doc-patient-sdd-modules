import request from "supertest";
import { describe, expect, it } from "vitest";
import { createJwtService } from "../src/auth/jwt.js";
import { createApp } from "../src/index.js";
const fakeUser = {
    id: "u1",
    email: "doctor@clinic.com",
    displayName: "Dr. Smith",
    role: "DOCTOR"
};
function buildApp() {
    const authService = {
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
    return createApp({
        env: {
            serverPort: 4000,
            databaseUrl: "postgres://local/test",
            jwtSecret: "test-secret",
            jwtExpiresInSec: 3600,
            loginRateLimitWindowSec: 60,
            loginRateLimitMaxAttempts: 5,
            accountLockMinutes: 5
        },
        authService
    });
}
describe("protected auth endpoints", () => {
    it("returns 401 for protected route without token", async () => {
        const app = buildApp();
        const response = await request(app).get("/api/v1/protected/dashboard");
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("AUTH_UNAUTHORIZED");
    });
    it("returns 200 for protected route with valid token", async () => {
        const app = buildApp();
        const token = createJwtService("test-secret", 3600).issueToken(fakeUser);
        const response = await request(app)
            .get("/api/v1/protected/dashboard")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Authorized");
    });
    it("returns authenticated user from /auth/me", async () => {
        const app = buildApp();
        const token = createJwtService("test-secret", 3600).issueToken(fakeUser);
        const response = await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe("doctor@clinic.com");
    });
});
