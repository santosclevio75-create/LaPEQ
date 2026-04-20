import { useAuth } from "@/_core/hooks/useAuth";

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminOnly component that only renders children if user is an admin.
 * Useful for hiding admin buttons and controls from regular users.
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
