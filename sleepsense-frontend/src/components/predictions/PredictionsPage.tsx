"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { predictionsApi } from "@/lib/api";
import { timeAgo, getStatusBadge, formatScore, scoreToGrade } from "@/lib/utils";
import type { Prediction } from "@/types";
import { Brain, ChevronLeft, ChevronRight, Eye, TrendingUp } from "lucide-react";
import { PredictionDetailModal } from "./PredictionDetailModal";

const predTypeLabel: Record<string, string> = {
  sleep_quality: "Sleep Quality",
  stress_level: "Stress Level",
  heart_rate_risk: "Heart Rate Risk",
  lifestyle_score: "Lifestyle Score",
};

export function PredictionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Prediction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["predictions", page, statusFilter],
    queryFn: () => predictionsApi.list({ page, per_page: 10, status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  const predictions: Prediction[] = data?.data?.items || [];
  const pagination = data?.data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Predictions</h1>
        <p className="text-gray-400 mt-1">ML model results and health predictions</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No predictions yet</p>
            <p className="text-gray-600 text-sm mt-1">Upload a dataset and run ML analysis to see predictions here</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span className="col-span-3">Type</span>
              <span className="col-span-2">Best Model</span>
              <span className="col-span-2">Accuracy</span>
              <span className="col-span-2">Confidence</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1 text-right">View</span>
            </div>
            <div className="divide-y divide-white/5">
              {predictions.map((p) => {
                const grade = p.accuracy ? scoreToGrade(p.accuracy) : null;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-6 py-4 grid grid-cols-12 items-center hover:bg-white/3 transition-colors">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{predTypeLabel[p.prediction_type] || p.prediction_type}</p>
                        <p className="text-xs text-gray-500">{timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                    <span className="col-span-2 text-sm text-gray-400">{p.best_model || "—"}</span>
                    <div className="col-span-2">
                      {p.accuracy != null ? (
                        <span className={`text-sm font-medium ${grade?.color}`}>
                          {formatScore(p.accuracy * 100, 1)}% <span className="text-xs opacity-70">({grade?.grade})</span>
                        </span>
                      ) : <span className="text-sm text-gray-600">—</span>}
                    </div>
                    <div className="col-span-2">
                      {p.confidence_score != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] h-1.5 bg-white/10 rounded-full">
                            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${p.confidence_score * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{formatScore(p.confidence_score * 100, 0)}%</span>
                        </div>
                      ) : <span className="text-sm text-gray-600">—</span>}
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(p.status)}`}>{p.status}</span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => setSelected(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <PredictionDetailModal prediction={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
