"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";

const subscribeToAuth = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener("pdf-pipeline-auth-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("pdf-pipeline-auth-change", onChange);
  };
};

export function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasAccessToken = useSyncExternalStore(
    subscribeToAuth,
    () => Boolean(getAccessToken()),
    () => false,
  );
  const isPublicRoute = pathname === "/login";

  useEffect(() => {
    if (!isPublicRoute && !hasAccessToken) router.replace("/login");
  }, [hasAccessToken, isPublicRoute, router]);

  if (isPublicRoute || hasAccessToken) return children;

  return null;
}
