"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsApi.list({ unread_only: true, per_page: 5 }),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.data?.unread_count || 0;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search datasets, predictions..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link href="/settings" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />
        </Link>

        {/* Avatar */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.full_name || "U")
          )}
        </Link>
      </div>
    </header>
  );
}
