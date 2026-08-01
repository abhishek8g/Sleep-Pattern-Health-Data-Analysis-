"use client";

import { motion } from "framer-motion";

interface SleepScoreCardProps {
  score: number;
  label: string;
  trend?: string;
  color: "indigo" | "purple" | "green" | "blue";
}

const colorMap = {
  indigo: { from: "#6366f1", to: "#818cf8", bg: "from-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  purple: { from: "#a855f7", to: "#c084fc", bg: "from-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  green: { from: "#22c55e", to: "#4ade80", bg: "from-green-500/10", border: "border-green-500/20", text: "text-green-400" },
  blue: { from: "#3b82f6", to: "#60a5fa", bg: "from-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
};

export function SleepScoreCard({ score, label, trend, color }: SleepScoreCardProps) {
  const c = colorMap[color];
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} to-transparent p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          {trend && <p className={`text-sm mt-1 ${c.text}`}>{trend}</p>}
          <div className="mt-4">
            <span className="text-5xl font-bold text-white">{score}</span>
            <span className="text-gray-400 text-lg ml-1">/100</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs improvement"}
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={`url(#gradient-${color})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={c.from} />
                <stop offset="100%" stopColor={c.to} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
