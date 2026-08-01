import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datasetsApi } from "@/lib/api";
import { useDebounce } from "./useDebounce";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Full datasets management hook — list, upload, delete with debounced search.
 */
export function useDatasets(initialPerPage = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const query = useQuery({
    queryKey: ["datasets", page, debouncedSearch, statusFilter],
    queryFn: () =>
      datasetsApi.list({
        page,
        per_page: initialPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Dataset deleted");
    },
    onError: () => toast.error("Failed to delete dataset"),
  });

  return {
    datasets: query.data?.data?.items ?? [],
    pagination: query.data?.data,
    isLoading: query.isLoading,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deleteDataset: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
