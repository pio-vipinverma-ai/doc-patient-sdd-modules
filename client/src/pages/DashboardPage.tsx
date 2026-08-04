import { useNavigate } from "react-router-dom";
import { authStore, useAuthState } from "../auth/authStore";

export function DashboardPage(): JSX.Element {
  const { session } = useAuthState();
  const navigate = useNavigate();

  const onLogout = (): void => {
    authStore.clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <main style={{ maxWidth: 560, margin: "3rem auto", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Doctor Dashboard</h1>
      <p>Welcome, {session?.user.displayName ?? "Doctor"}</p>
      <p>Secure access is active.</p>
      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}
