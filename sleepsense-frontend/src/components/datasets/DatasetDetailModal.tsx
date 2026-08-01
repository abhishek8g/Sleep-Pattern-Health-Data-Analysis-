"use client";

import { motion } from "framer-motion";
import { X, Database, BarChart2, Brain, Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datasetsApi, predictionsApi } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Dataset } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from "recharts";

interface Props { dataset: Dataset; onClose: () => void; }

type Tab = "overview" | "eda" | "predict";

export function DatasetDetailModal({ dataset, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [predType, setPredType] = useState("sleep_quality");
  const queryClient = useQueryClient();

  const { data: edaData, isLoading: edaLoading, refetch: refetchEDA } = useQuery({
    queryKey: ["eda", dataset.id],
    queryFn: () => datasetsApi.getEDA(dataset.id),
    enabled: tab === "eda",
  });

  const predictMutation = useMutation({
    mutationFn: () => predictionsApi.create({
      dataset_id: dataset.id,
      prediction_type: predType as any,
    }),
    onSuccess: () => {
      toast.success("Prediction started! Check the Predictions page for results.");
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Prediction failed"),
  });

  const eda = edaData?.data;

  const distData = eda?.distributions
    ? Object.entries(eda.distributions).slice(0, 1).map(([col, d]: [string, any]) =>
        d.counts.map((c: number, i: number) => ({
          range: `${(d.bin_edges[i] || 0).toFixed(1)}`,
          count: c,
        }))
      )[0]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d1f] z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{dataset.name}</h2>
              <p className="text-xs text-gray-500">{formatBytes(dataset.file_size)} · {dataset.file_type.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["overview", "eda", "predict"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-indigo-500/20 text-indigo-400" : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}>{t === "eda" ? "EDA & Charts" : t === "predict" ? "Run ML" : t}</button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Rows", value: dataset.row_count?.toLocaleString() || "N/A" },
                  { label: "Columns", value: dataset.column_count || "N/A" },
                  { label: "File Size", value: formatBytes(dataset.file_size) },
                  { label: "Uploaded", value: formatDate(dataset.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/3 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {dataset.preview_data && dataset.preview_data.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Data Preview (first 10 rows)</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {Object.keys(dataset.preview_data[0]).map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataset.preview_data.map((row, i) => (
                          <tr key={i} className="border-b border-white/3 hover:bg-white/3">
                            {Object.values(row).map((v: any, j) => (
                              <td key={j} className="px-3 py-2 text-gray-300 truncate max-w-[120px]">{String(v ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {dataset.cleaning_report && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-green-400 mb-2">🧹 Auto-Cleaning Report</h3>
                  <ul className="space-y-1">
                    {(dataset.cleaning_report.actions || []).map((action: string, i: number) => (
                      <li key={i} className="text-xs text-gray-400">✓ {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* EDA Tab */}
          {tab === "eda" && (
            <div className="space-y-6">
              {edaLoading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                  <p className="text-gray-400 text-sm">Running exploratory data analysis...</p>
                </div>
              ) : eda?.status === "processing" ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-gray-400 text-sm mb-4">EDA is being processed...</p>
                  <button onClick={() => refetchEDA()} className="flex items-center gap-2 text-indigo-400 text-sm hover:text-indigo-300">
                    <RefreshCw className="w-4 h-4" /> Check again
                  </button>
                </div>
              ) : eda ? (
                <>
                  {/* Missing Values */}
                  {eda.missing_values && Object.keys(eda.missing_values).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Missing Values</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(eda.missing_values).slice(0, 8).map(([col, count]: [string, any]) => (
                          <div key={col} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                            <span className="text-xs text-gray-400 truncate">{col}</span>
                            <span className={`text-xs font-medium ml-2 ${count > 0 ? "text-yellow-400" : "text-green-400"}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distribution Chart */}
                  {distData && distData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Distribution</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={distData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="range" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* AI Insights */}
                  {eda.ai_insights && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-indigo-400 mb-2">🤖 AI Insights</h3>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{eda.ai_insights}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Click the tab to trigger EDA analysis</p>
                </div>
              )}
            </div>
          )}

          {/* Predict Tab */}
          {tab === "predict" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Select a prediction type and train multiple ML models automatically.</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prediction Type</label>
                <select value={predType} onChange={(e) => setPredType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all">
                  <option value="sleep_quality">Sleep Quality</option>
                  <option value="stress_level">Stress Level</option>
                  <option value="heart_rate_risk">Heart Rate Risk</option>
                  <option value="lifestyle_score">Lifestyle Score</option>
                </select>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 text-sm text-gray-400">
                <p className="font-medium text-indigo-400 mb-2">Models that will be trained:</p>
                <div className="grid grid-cols-2 gap-1">
                  {["Random Forest", "Decision Tree", "XGBoost", "LightGBM", "CatBoost", "Gradient Boosting", "KNN", "Neural Network"].map((m) => (
                    <span key={m} className="text-xs text-gray-400">✓ {m}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => predictMutation.mutate()} disabled={predictMutation.isPending || dataset.status !== "ready"}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2">
                {predictMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Starting...</> : <><Brain className="w-4 h-4" />Run ML Analysis</>}
              </button>
              {dataset.status !== "ready" && (
                <p className="text-yellow-400 text-xs text-center">Dataset must be in "ready" status to run predictions.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
