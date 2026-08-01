import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Guards a page: redirects to /login if not authenticated.
 * Redirects to /dashboard if already authenticated (for auth pages).
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}

export function useRequireGuest() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}

export function useIsAdmin() {
  const { user } = useAuthStore();
  return user?.role === "admin";
}

export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
}
