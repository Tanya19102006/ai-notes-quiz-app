import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Only logged-in users can open the nested routes
export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Login/Signup pages redirect to Home when already logged in
export function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : children;
}
