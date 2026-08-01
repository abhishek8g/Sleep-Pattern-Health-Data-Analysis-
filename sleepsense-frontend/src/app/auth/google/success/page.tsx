"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      toast.error("Google login failed");
      router.replace("/login");
      return;
    }

    // Store tokens then fetch user
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }

    authApi.me()
      .then((res) => {
        setAuth(res.data, accessToken, refreshToken);
        toast.success(`Welcome, ${res.data.full_name.split(" ")[0]}!`);
        router.replace(res.data.role === "admin" ? "/admin/dashboard" : "/dashboard");
      })
      .catch(() => {
        toast.error("Google login failed. Please try again.");
        router.replace("/login");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
        <p className="text-gray-400">Completing Google sign-in…</p>
      </div>
    </div>
  );
}
