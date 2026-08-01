"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { usersApi, datasetsApi, predictionsApi, aiApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatDate, timeAgo, getStatusBadge } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { SleepScoreCard } from "./SleepScoreCard";
import { RecentActivity } from "./RecentActivity";
import { WeeklyChart } from "./WeeklyChart";
import {
  Database, Brain, FileText, TrendingUp, Plus, ArrowRight
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
};

export function DashboardOverview() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => usersApi.getStats(),
  });

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets", "recent"],
    queryFn: () => datasetsApi.list({ page: 1, per_page: 5 }),
  });

  const { data: predictionsData } = useQuery({
    queryKey: ["predictions", "recent"],
    queryFn: () => predictionsApi.list({ page: 1, per_page: 5 }),
  });

  const { data: weeklyReport } = useQuery({
    queryKey: ["ai-weekly"],
    queryFn: () => aiApi.weeklyReport(),
  });

  const stats = statsData?.data;
  const recentDatasets = datasetsData?.data?.items || [];
  const recentPredictions = predictionsData?.data?.items || [];
  const aiReport = weeklyReport?.data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's what's happening with your health data today.</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SleepScoreCard
          score={aiReport?.sleep_score || 72}
          label="Sleep Score"
          trend="+5 from last week"
          color="indigo"
        />
        <SleepScoreCard
          score={aiReport?.health_score || 68}
          label="Health Score"
          trend="+2 from last week"
          color="purple"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Datasets Uploaded", value: stats?.datasets_uploaded ?? 0, icon: Database, color: "blue", href: "/datasets" },
          { label: "Predictions Made", value: stats?.predictions_made ?? 0, icon: Brain, color: "purple", href: "/predictions" },
          { label: "Reports Generated", value: stats?.reports_generated ?? 0, icon: FileText, color: "green", href: "/reports" },
          { label: "Login Count", value: stats?.login_count ?? 0, icon: TrendingUp, color: "orange", href: "/profile" },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <RecentActivity predictions={recentPredictions} datasets={recentDatasets} />
      </div>

      {/* Recent Datasets */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">Recent Datasets</h3>
          <Link href="/datasets" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentDatasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">No datasets yet</p>
            <Link href="/datasets"
              className="mt-3 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
              <Plus className="w-4 h-4" /> Upload your first dataset
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentDatasets.map((d: any) => (
              <Link key={d.id} href={`/datasets/${d.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.row_count ? `${d.row_count.toLocaleString()} rows` : d.file_type.toUpperCase()} · {timeAgo(d.created_at)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                  {d.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Summary */}
      {aiReport?.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white">AI Weekly Summary</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{aiReport.summary}</p>
          <Link href="/ai-chat" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
            Ask AI a question <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
