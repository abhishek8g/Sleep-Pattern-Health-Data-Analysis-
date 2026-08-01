"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const colorMap = {
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
  green: "bg-green-500/10 text-green-400",
  orange: "bg-orange-500/10 text-orange-400",
  red: "bg-red-500/10 text-red-400",
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: keyof typeof colorMap;
  href?: string;
  change?: string;
}

export function StatCard({ label, value, icon: Icon, color, href, change }: StatCardProps) {
  const content = (
    <div className="stat-card bg-white/3 border-white/5 hover:border-white/10 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{change}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}
