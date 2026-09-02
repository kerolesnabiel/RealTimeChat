import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/authStore";

export default function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/chats" replace />;
  }

  return <Outlet />;
}
