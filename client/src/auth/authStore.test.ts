import { describe, beforeEach, expect, it } from "vitest";
import { authStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    authStore.resetForTests();
  });

  it("stores and retrieves authenticated session", () => {
    authStore.setSession({
      accessToken: "token-1",
      user: {
        id: "u1",
        email: "doctor@clinic.com",
        displayName: "Dr. Smith",
        role: "DOCTOR"
      }
    });

    expect(authStore.getSnapshot().session?.accessToken).toBe("token-1");
    expect(localStorage.getItem("doc-patient-auth-session")).toContain("token-1");
  });

  it("clears session and local storage", () => {
    authStore.setSession({
      accessToken: "token-2",
      user: {
        id: "u1",
        email: "doctor@clinic.com",
        displayName: "Dr. Smith",
        role: "DOCTOR"
      }
    });

    authStore.clearSession();

    expect(authStore.getSnapshot().session).toBeNull();
    expect(localStorage.getItem("doc-patient-auth-session")).toBeNull();
  });
});
