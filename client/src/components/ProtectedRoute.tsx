import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

/**
 * ProtectedRoute component that restricts access to authenticated users with specific roles.
 * Redirects to home page if user is not authenticated or doesn't have required role.
 */
export function ProtectedRoute({ children, requiredRole = "admin" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated
    if (!user) {
      setLocation("/");
      return;
    }

    // Redirect if user doesn't have required role
    if (requiredRole === "admin" && user.role !== "admin") {
      setLocation("/");
      return;
    }
  }, [user, loading, requiredRole, setLocation]);

  // Show nothing while loading or redirecting
  if (loading || !user || (requiredRole === "admin" && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
