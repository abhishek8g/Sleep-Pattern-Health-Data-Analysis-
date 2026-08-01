"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { datasetsApi, predictionsApi, aiApi } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { BarChart2, Brain, Database, TrendingUp } from "lucide-react";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#22d3ee", "#f59e0b", "#10b981"];

const MONTHLY_SLEEP = [
  { month: "Jul", score: 68, quality: 72, duration: 6.8 },
  { month: "Aug", score: 71, quality: 75, duration: 7.1 },
  { month: "Sep", score: 65, quality: 69, duration: 6.5 },
  { month: "Oct", score: 74, quality: 78, duration: 7.4 },
  { month: "Nov", score: 79, quality: 82, duration: 7.8 },
  { month: "Dec", score: 76, quality: 80, duration: 7.6 },
  { month: "Jan", score: 82, quality: 85, duration: 8.0 },
];

export function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets-analytics"],
    queryFn: () => datasetsApi.list({ per_page: 100 }),
  });

  const { data: predictionsData } = useQuery({
    queryKey: ["predictions-analytics"],
    queryFn: () => predictionsApi.list({ per_page: 100 }),
  });

  const { data: weeklyData } = useQuery({
    queryKey: ["ai-weekly-analytics"],
    queryFn: () => aiApi.weeklyReport(),
  });

  const datasets = datasetsData?.data?.items || [];
  const predictions = predictionsData?.data?.items || [];
  const weekly = weeklyData?.data;

  // Dataset status breakdown
  const statusCounts = datasets.reduce((acc: Record<string, number>, d: any) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Prediction type breakdown
  const predTypeCounts = predictions.reduce((acc: Record<string, number>, p: any) => {
    const label = p.prediction_type.replace(/_/g, " ");
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const predPieData = Object.entries(predTypeCounts).map(([name, value]) => ({ name, value }));

  // Accuracy distribution
  const accuracyData = predictions
    .filter((p: any) => p.accuracy != null)
    .map((p: any) => ({
      name: p.prediction_type.replace(/_/g, " "),
      accuracy: Math.round(p.accuracy * 100),
      model: p.best_model || "N/A",
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Comprehensive health & platform analytics</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          {(["week", "month", "year"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                period === p ? "bg-indigo-500/20 text-indigo-400" : "text-gray-500 hover:text-white"
              }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Health Score", value: `${weekly?.health_score || 70}/100`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Sleep Score", value: `${weekly?.sleep_score || 72}/100`, icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Datasets", value: datasets.length, icon: Database, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Predictions", value: predictions.length, icon: BarChart2, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/5 bg-white/3 p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sleep Score Trend */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <h3 className="font-semibold text-white mb-6">Sleep Score Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={MONTHLY_SLEEP}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} domain={[50, 100]} />
            <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "12px", color: "#e2e8f0" }} />
            <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
            <Area type="monotone" dataKey="score" name="Sleep Score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "#6366f1", r: 3 }} />
            <Area type="monotone" dataKey="quality" name="Sleep Quality" stroke="#a855f7" strokeWidth={2} fill="url(#qualityGrad)" dot={{ fill: "#a855f7", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sleep Duration Bar */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-6">Avg Sleep Duration (hours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_SLEEP}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} domain={[5, 9]} />
              <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "12px", color: "#e2e8f0" }} formatter={(v: any) => [`${v}h`, "Duration"]} />
              <Bar dataKey="duration" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Sleep Duration" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dataset Status Pie */}
        <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-6">Dataset Status</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-gray-400 capitalize">{entry.name}</span></span>
                    <span className="text-white font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 text-sm">No dataset data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Prediction Accuracy */}
      {accuracyData.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-6">Prediction Accuracy by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accuracyData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} width={110} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Recommendations Preview */}
      {weekly && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <h3 className="font-semibold text-indigo-400 mb-4">🤖 AI Health Insights</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{weekly.summary}</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="font-medium text-white mb-1">Datasets analyzed</p>
              <p>{weekly.datasets_analyzed}</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">Predictions completed</p>
              <p>{weekly.predictions_completed}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
