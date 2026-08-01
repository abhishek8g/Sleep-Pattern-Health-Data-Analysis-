import Link from "next/link";
import { Moon, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8">
          <Moon className="w-7 h-7 text-white" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-xl font-medium text-white transition-all"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
