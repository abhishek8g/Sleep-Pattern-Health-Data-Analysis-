"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { datasetsApi } from "@/lib/api";
import { formatBytes, timeAgo, getStatusBadge } from "@/lib/utils";
import { DatasetDetailModal } from "./DatasetDetailModal";
import type { Dataset } from "@/types";
import toast from "react-hot-toast";
import {
  Upload, Database, Trash2, Eye, Search, Filter,
  FileText, UploadCloud, X, Loader2, ChevronLeft, ChevronRight, BarChart2
} from "lucide-react";

export function DatasetsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; rows: any[] } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["datasets", page, search, statusFilter],
    queryFn: () => datasetsApi.list({ page, per_page: 10, search: search || undefined, status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Dataset deleted");
    },
    onError: () => toast.error("Delete failed"),
  });

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Preview first
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",");
      const rows = lines.slice(1, 6).map((line) =>
        Object.fromEntries(line.split(",").map((v, i) => [headers[i]?.trim(), v.trim()]))
      );
      setPreviewFile({ name: file.name, rows });
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      await datasetsApi.upload(file);
      clearInterval(interval);
      setUploadProgress(100);
      toast.success(`${file.name} uploaded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      setTimeout(() => { setUploading(false); setUploadProgress(0); setPreviewFile(null); }, 1000);
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.detail || "Upload failed");
      setUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/json": [".json"] },
    multiple: false,
    disabled: uploading,
  });

  const datasets: Dataset[] = data?.data?.items || [];
  const pagination = data?.data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Datasets</h1>
          <p className="text-gray-400 mt-1">Upload and manage your sleep health datasets</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/3"
      } ${uploading ? "cursor-not-allowed opacity-60" : ""}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-400 mx-auto animate-spin" />            <p className="text-white font-medium">Uploading...</p>
            <div className="w-full max-w-sm mx-auto bg-white/10 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-gray-500 text-sm">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-3">
            <UploadCloud className={`w-10 h-10 mx-auto ${isDragActive ? "text-indigo-400" : "text-gray-500"}`} />
            <div>
              <p className="text-white font-medium">{isDragActive ? "Drop your file here" : "Drag & drop your dataset"}</p>
              <p className="text-gray-500 text-sm mt-1">or <span className="text-indigo-400">browse files</span></p>
            </div>
            <p className="text-gray-600 text-xs">Supports CSV, Excel (.xlsx), JSON · Max 50MB</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {previewFile && !uploading && (
        <div className="rounded-xl border border-white/10 bg-white/3 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Preview: {previewFile.name}</p>
            <button onClick={() => setPreviewFile(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr>{Object.keys(previewFile.rows[0] || {}).map((h) => (
                  <th key={h} className="text-left px-2 py-1.5 text-gray-400 font-medium border-b border-white/5">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {previewFile.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/3">{Object.values(row).map((v: any, j) => (
                    <td key={j} className="px-2 py-1.5 text-gray-300 truncate max-w-24">{String(v)}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search datasets..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all">
          <option value="">All Status</option>
          <option value="ready">Ready</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Dataset List */}
      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No datasets found</p>
            <p className="text-gray-600 text-sm mt-1">Upload a CSV, Excel, or JSON file to get started</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span className="col-span-4">Name</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Size</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            <div className="divide-y divide-white/5">
              {datasets.map((d) => (
                <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-6 py-4 grid grid-cols-12 items-center hover:bg-white/3 transition-colors group">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{d.name}</p>
                      <p className="text-xs text-gray-500">{timeAgo(d.created_at)}</p>
                    </div>
                  </div>
                  <span className="col-span-2 text-sm text-gray-400 uppercase">{d.file_type}</span>
                  <span className="col-span-2 text-sm text-gray-400">{formatBytes(d.file_size)}</span>
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 justify-end">
                    <button onClick={() => setSelectedDataset(d)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelectedDataset(d)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                      <BarChart2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm("Delete this dataset?")) deleteMutation.mutate(d.id); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dataset Detail Modal */}
      <AnimatePresence>
        {selectedDataset && (
          <DatasetDetailModal dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
