"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { predictionsApi } from "@/lib/api";

const mockData = [
  { day: "Mon", sleep_score: 72, health_score: 65 },
  { day: "Tue", sleep_score: 68, health_score: 70 },
  { day: "Wed", sleep_score: 80, health_score: 75 },
  { day: "Thu", sleep_score: 75, health_score: 72 },
  { day: "Fri", sleep_score: 85, health_score: 80 },
  { day: "Sat", sleep_score: 78, health_score: 74 },
  { day: "Sun", sleep_score: 82, health_score: 78 },
];

export function WeeklyChart() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
      <h3 className="font-semibold text-white mb-6">Weekly Health Trends</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={mockData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "#1e1b4b",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "12px",
              color: "#e2e8f0",
            }}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
          <Area type="monotone" dataKey="sleep_score" name="Sleep Score" stroke="#6366f1" strokeWidth={2} fill="url(#sleepGrad)" dot={false} />
          <Area type="monotone" dataKey="health_score" name="Health Score" stroke="#a855f7" strokeWidth={2} fill="url(#healthGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
