"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { formatDate, getStatusBadge } from "@/lib/utils";
import {
  Users, Database, Brain, TrendingUp, Shield, Activity
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(),
  });

  const stats = data?.data;

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Users", value: stats.active_users, icon: Shield, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Datasets", value: stats.total_datasets, icon: Database, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Predictions", value: stats.total_predictions, icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "New Users (30d)", value: stats.new_users_30_days, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Platform overview and management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? [...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)
          : statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Registrations */}
        {stats?.daily_registrations && (
          <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h3 className="font-semibold text-white mb-5">User Registrations (7 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.daily_registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#e2e8f0", fontSize: "12px" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Users */}
        {stats?.top_users && (
          <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h3 className="font-semibold text-white mb-5">Most Active Users</h3>
            <div className="space-y-3">
              {stats.top_users.map((u: any, i: number) => (
                <div key={u.id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-600 w-6 text-right">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-400">{u.datasets} datasets</span>
                </div>
              ))}
              {stats.top_users.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No user data yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
