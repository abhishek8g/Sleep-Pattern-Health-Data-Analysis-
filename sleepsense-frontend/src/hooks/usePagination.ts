import { useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

/**
 * Reusable pagination state hook.
 */
export function usePagination({ initialPage = 1, initialPerPage = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const goToPage = (p: number) => setPage(p);
  const nextPage = () => setPage((prev) => prev + 1);
  const prevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const reset = () => setPage(initialPage);

  return { page, perPage, setPage, setPerPage, goToPage, nextPage, prevPage, reset };
}
