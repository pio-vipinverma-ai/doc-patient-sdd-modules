import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "../auth/authStore";

type ProtectedRouteProps = {
  children: JSX.Element;
};

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { session } = useAuthState();
  const location = useLocation();

  if (!session) {
    const returnTo = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return children;
}
