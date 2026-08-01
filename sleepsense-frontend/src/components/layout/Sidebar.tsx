"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { cn, getInitials } from "@/lib/utils";
import {
  LayoutDashboard, Database, Brain, FileText, Bell, Settings,
  User, BarChart2, MessageSquare, Moon, LogOut, ChevronLeft,
  Shield, Users, Activity, Menu, X, Star
} from "lucide-react";

const userNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Datasets", href: "/datasets", icon: Database },
  { label: "Predictions", href: "/predictions", icon: Brain },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "AI Assistant", href: "/ai-chat", icon: MessageSquare },
  { label: "Feedback", href: "/feedback", icon: Star },
];

const userBottomItems = [
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Admin Dashboard", href: "/admin/dashboard", icon: Shield },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Activity Logs", href: "/admin/activity", icon: Activity },
  { label: "System Stats", href: "/admin/stats", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const mainNav = isAdmin ? [...adminNavItems, ...userNavItems] : userNavItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Moon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">SleepSense AI</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {isAdmin && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 font-medium px-3 mb-2 uppercase tracking-wider">Admin</p>
            {adminNavItems.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
            <div className="my-3 border-t border-white/5" />
            <p className="text-xs text-gray-600 font-medium px-3 mb-2 uppercase tracking-wider">User</p>
          </div>
        )}
        {userNavItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {userBottomItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-white/3 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.full_name || "U")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={clearAuth}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0d0d1f] border-r border-white/5 flex-col z-40">
        <SidebarContent />
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/5 border border-white/10 text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0d0d1f] border-r border-white/5 z-50"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, pathname }: { item: { label: string; href: string; icon: any }; pathname: string }) {
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  return (
    <Link href={item.href}
      className={cn("sidebar-item", isActive && "sidebar-item-active")}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </Link>
  );
}
