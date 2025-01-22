import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";

export default function PublicRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (authUser) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return <div className="relative z-10">{children}</div>;
}
