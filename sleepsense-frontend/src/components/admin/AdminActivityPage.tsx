"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { motion } from "framer-motion";
import { timeAgo } from "@/lib/utils";
import { Activity, ChevronLeft, ChevronRight, Globe, User } from "lucide-react";

export function AdminActivityPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", page],
    queryFn: () => adminApi.activityLogs({ page, per_page: 50 }),
    placeholderData: (prev) => prev,
  });

  const logs = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const pages = Math.ceil(total / 50);

  // Method color
  const methodColor = (action: string) => {
    if (action.startsWith("POST")) return "text-green-400 bg-green-500/10";
    if (action.startsWith("DELETE")) return "text-red-400 bg-red-500/10";
    if (action.startsWith("PUT")) return "text-yellow-400 bg-yellow-500/10";
    return "text-blue-400 bg-blue-500/10";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400 text-sm">{total.toLocaleString()} total events</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Activity className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-500">No activity logs yet</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span className="col-span-4">Action</span>
              <span className="col-span-3">Description</span>
              <span className="col-span-2">IP Address</span>
              <span className="col-span-2">User</span>
              <span className="col-span-1 text-right">Time</span>
            </div>
            <div className="divide-y divide-white/3 max-h-[600px] overflow-y-auto scrollbar-hide">
              {logs.map((log: any, i: number) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="px-6 py-3 grid grid-cols-12 items-center hover:bg-white/3 transition-colors text-sm">
                  <div className="col-span-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${methodColor(log.action)}`}>
                      {log.action.split(" ")[0]}
                    </span>
                    <span className="text-gray-400 ml-2 text-xs truncate">{log.action.split(" ").slice(1).join(" ")}</span>
                  </div>
                  <span className="col-span-3 text-xs text-gray-500 truncate">{log.description}</span>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500">{log.ip_address || "—"}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{log.user_id ? log.user_id.slice(0, 8) + "…" : "System"}</span>
                  </div>
                  <span className="col-span-1 text-xs text-gray-600 text-right">{timeAgo(log.created_at)}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= pages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
