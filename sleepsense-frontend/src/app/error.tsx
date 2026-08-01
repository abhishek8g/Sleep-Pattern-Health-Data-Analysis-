"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-2 text-sm leading-relaxed">
          An unexpected error occurred. We've been notified and are working on a fix.
        </p>
        {error?.digest && (
          <p className="text-gray-600 text-xs mb-8 font-mono">Error ID: {error.digest}</p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-5 py-2.5 rounded-xl text-red-400 font-medium text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl text-gray-300 hover:text-white font-medium text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
