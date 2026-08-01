"use client";

import { motion } from "framer-motion";
import { X, Brain, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { predictionsApi } from "@/lib/api";
import { formatScore, formatDate } from "@/lib/utils";
import type { Prediction } from "@/types";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

interface Props { prediction: Prediction; onClose: () => void; }

export function PredictionDetailModal({ prediction, onClose }: Props) {
  const { data: explainData, isLoading } = useQuery({
    queryKey: ["predict-explain", prediction.id],
    queryFn: () => predictionsApi.explain(prediction.id),
    enabled: prediction.status === "completed",
  });

  const explain = explainData?.data;

  // Build model comparison data
  const modelData = prediction.model_results
    ? Object.entries(prediction.model_results)
        .filter(([, v]: any) => !v.error && (v.accuracy != null || v.r2 != null))
        .map(([name, v]: any) => ({
          name: name.replace(" ", "\n"),
          score: Math.round(((v.accuracy || v.r2 || 0)) * 100),
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  const featureData = explain?.feature_importance
    ? Object.entries(explain.feature_importance)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 8)
        .map(([name, value]: any) => ({ name, value: Math.round(value * 100) }))
    : [];

  const metrics = [
    { label: "Accuracy", value: prediction.accuracy },
    { label: "Precision", value: prediction.precision },
    { label: "Recall", value: prediction.recall },
    { label: "F1 Score", value: prediction.f1_score },
  ].filter((m) => m.value != null);

  const radarData = metrics.map((m) => ({
    metric: m.label,
    value: Math.round((m.value || 0) * 100),
    fullMark: 100,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d1f] z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white capitalize">{prediction.prediction_type.replace("_", " ")} Prediction</h2>
              <p className="text-xs text-gray-500">Best model: {prediction.best_model || "N/A"} · {formatDate(prediction.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Accuracy", value: prediction.accuracy },
              { label: "Precision", value: prediction.precision },
              { label: "Recall", value: prediction.recall },
              { label: "F1 Score", value: prediction.f1_score },
              { label: "MAE", value: prediction.mae },
              { label: "RMSE", value: prediction.rmse },
              { label: "R²", value: prediction.r2_score },
              { label: "Confidence", value: prediction.confidence_score },
            ].filter((m) => m.value != null).map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-white">{formatScore(value! * (label === "MAE" || label === "RMSE" ? 1 : 100), 1)}{label !== "MAE" && label !== "RMSE" ? "%" : ""}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Comparison */}
            {modelData.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Model Comparison</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={modelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => [`${v}%`]} />
                    <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Radar */}
            {radarData.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Feature Importance */}
          {featureData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Feature Importance</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={featureData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => [`${v}%`]} />
                  <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Explanation */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading AI explanation...
            </div>
          ) : explain?.explanation && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-indigo-400 mb-2">🤖 AI Explanation</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{explain.explanation}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
