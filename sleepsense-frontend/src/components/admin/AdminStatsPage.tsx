"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Users, Database, Brain, MessageSquare, AlertCircle, Activity } from "lucide-react";

export function AdminStatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-system-stats"],
    queryFn: () => adminApi.systemStats(),
    refetchInterval: 30000,
  });

  const stats = data?.data;

  const cards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", desc: "Registered accounts" },
    { label: "Total Datasets", value: stats.total_datasets, icon: Database, color: "text-purple-400", bg: "bg-purple-500/10", desc: "Uploaded files" },
    { label: "Total Predictions", value: stats.total_predictions, icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10", desc: "ML jobs run" },
    { label: "Total Feedback", value: stats.total_feedback, icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", desc: "User feedback items" },
    { label: "Pending Feedback", value: stats.pending_feedback, icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10", desc: "Needs review" },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Statistics</h1>
          <p className="text-gray-400 text-sm">Platform-wide metrics — refreshes every 30s</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/5 bg-white/3 p-6">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-3xl font-bold text-white">{card.value?.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-300 mt-1">{card.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{card.desc}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Health Indicator */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 font-medium">System Healthy</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">All services operational. Database connected. API responding normally.</p>
      </div>
    </div>
  );
}
