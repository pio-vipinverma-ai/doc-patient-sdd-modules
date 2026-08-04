import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authStore } from "../auth/authStore";
import { login } from "../auth/authApi";

function normalizeReturnTo(raw: string | null): string {
  if (!raw) {
    return "/dashboard";
  }

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }

  return raw;       
}

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("doctor@clinic.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return normalizeReturnTo(query.get("returnTo"));
  }, [location.search]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await login({ email, password });
      authStore.setSession({
        accessToken: response.accessToken,
        user: response.user
      });
      navigate(returnTo, { replace: true });
    } catch {
      setErrorMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #f4f8ff 0%, #f9fff7 100%)",
        fontFamily: "Segoe UI, sans-serif"
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "min(92vw, 420px)",
          padding: "1.5rem",
          borderRadius: "14px",
          border: "1px solid #d7e3f3",
          background: "white",
          boxShadow: "0 8px 24px rgba(32, 54, 92, 0.08)"
        }}
      >
        <h1>Doctor Login</h1>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ width: "100%", marginBottom: "0.75rem" }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        {errorMessage && (
          <p role="alert" style={{ color: "#9f2222" }}>
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
