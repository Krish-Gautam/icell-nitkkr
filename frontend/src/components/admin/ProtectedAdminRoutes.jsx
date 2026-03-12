import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedAdminRoute() {

  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}