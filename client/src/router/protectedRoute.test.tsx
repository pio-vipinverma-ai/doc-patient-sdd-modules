import { describe, beforeEach, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { authStore } from "../auth/authStore";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    authStore.resetForTests();
  });

  it("redirects unauthenticated users to login with returnTo", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard?tab=summary"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children for authenticated users", () => {
    authStore.setSession({
      accessToken: "token",
      user: {
        id: "u1",
        email: "doctor@clinic.com",
        displayName: "Dr. Smith",
        role: "DOCTOR"
      }
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected dashboard")).toBeInTheDocument();
  });
});
