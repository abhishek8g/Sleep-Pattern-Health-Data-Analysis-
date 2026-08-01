import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import toast from "react-hot-toast";

/**
 * Notifications hook — provides list, unread count, mark-read helpers.
 */
export function useNotifications(options: { unreadOnly?: boolean; perPage?: number } = {}) {
  const queryClient = useQueryClient();
  const { unreadOnly = false, perPage = 20 } = options;

  const query = useQuery({
    queryKey: ["notifications", { unreadOnly, perPage }],
    queryFn: () => notificationsApi.list({ unread_only: unreadOnly, per_page: perPage }),
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  return {
    notifications: query.data?.data?.items ?? [],
    unreadCount: query.data?.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAll: markAllRead.isPending,
  };
}
