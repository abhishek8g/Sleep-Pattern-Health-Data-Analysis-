"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { reportsApi, datasetsApi } from "@/lib/api";
import { timeAgo, downloadBlob } from "@/lib/utils";
import { FileText, Download, Plus, Loader2, Database } from "lucide-react";
import toast from "react-hot-toast";

export function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.list({ per_page: 20 }),
  });

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets-for-reports"],
    queryFn: () => datasetsApi.list({ status: "ready", per_page: 50 }),
  });

  const reports = reportsData?.data?.items || [];
  const datasets = datasetsData?.data?.items || [];

  const generateReport = async (datasetId: string, datasetName: string) => {
    setGenerating(datasetId);
    try {
      await reportsApi.generate(datasetId, "pdf");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(`Report generated for ${datasetName}!`);
    } catch {
      toast.error("Report generation failed");
    } finally {
      setGenerating(null);
    }
  };

  const downloadPDF = async (datasetId: string, datasetName: string) => {
    try {
      const res = await reportsApi.downloadPDF(datasetId);
      downloadBlob(new Blob([res.data], { type: "application/pdf" }), `${datasetName}_report.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Generate and download PDF, Excel, and CSV reports</p>
      </div>

      {/* Generate New Report */}
      {datasets.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-4">Generate Report</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {datasets.slice(0, 6).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-white truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button onClick={() => generateReport(d.id, d.name)} disabled={generating === d.id}
                    className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                    {generating === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => downloadPDF(d.id, d.name)}
                    className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">Report History</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No reports yet</p>
            <p className="text-gray-600 text-sm mt-1">Generate a report from your datasets above</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((r: any) => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.report_type.toUpperCase()} · {timeAgo(r.created_at)}</p>
                  </div>
                </div>
                {r.dataset_id && (
                  <button onClick={() => downloadPDF(r.dataset_id, r.title)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
