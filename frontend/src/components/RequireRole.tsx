import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Role } from "../types";

export default function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const currentRole = useAuthStore((s) => s.role);
  if (currentRole !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
