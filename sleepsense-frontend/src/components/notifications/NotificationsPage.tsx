"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { notificationsApi } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { Bell, CheckCheck, Brain, Database, Zap, Info, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import type { Notification } from "@/types";

const typeIconMap: Record<string, any> = {
  prediction_completed: Brain,
  dataset_processed: Database,
  weekly_summary: Zap,
  system: Info,
  achievement: Trophy,
};

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ per_page: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const notifications: Notification[] = data?.data?.items || [];
  const unreadCount = data?.data?.unread_count || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-600 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => {
              const Icon = typeIconMap[n.notification_type] || Bell;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                  className={`flex gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-white/3 ${
                    !n.is_read ? "bg-indigo-500/3" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.notification_type === "prediction_completed" ? "bg-purple-500/10" :
                    n.notification_type === "dataset_processed" ? "bg-blue-500/10" :
                    n.notification_type === "achievement" ? "bg-yellow-500/10" :
                    "bg-white/5"
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      n.notification_type === "prediction_completed" ? "text-purple-400" :
                      n.notification_type === "dataset_processed" ? "text-blue-400" :
                      n.notification_type === "achievement" ? "text-yellow-400" :
                      "text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
