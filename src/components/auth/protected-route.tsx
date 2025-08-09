"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "teacher" | "student";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session.loading) {
      if (!session.user) {
        // Redirect to sign-in if not authenticated
        router.push("/sign-in");
        return;
      }

      if (requiredRole && session.user.role !== requiredRole) {
        // Redirect to appropriate dashboard if role doesn't match
        if (session.user.role === "teacher") {
          router.push("/");
        } else {
          router.push("/student-dashboard");
        }
        return;
      }
    }
  }, [session.user, session.loading, requiredRole, router]);

  if (session.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return null; // Will redirect via useEffect
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
