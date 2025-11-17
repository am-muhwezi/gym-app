import { useState, useCallback, useEffect } from 'react';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: T[];
}

interface UsePaginationResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

interface UsePaginationOptions<T> {
  fetchPage: (page: number, pageSize?: number) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  initialLoad?: boolean;
}

export function usePagination<T>({
  fetchPage,
  pageSize = 20,
  initialLoad = true,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const loadPage = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchPage(page, pageSize);

        if (append) {
          setItems((prev) => [...prev, ...response.results]);
        } else {
          setItems(response.results);
        }

        setCurrentPage(response.current_page);
        setTotalPages(response.total_pages);
        setTotalCount(response.count);
        setHasNext(response.next !== null);
        setHasPrevious(response.previous !== null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error('Pagination error:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (hasNext && !loading) {
      await loadPage(currentPage + 1, true);
    }
  }, [hasNext, loading, currentPage, loadPage]);

  const refresh = useCallback(async () => {
    setItems([]);
    setCurrentPage(0);
    await loadPage(1, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setError(null);
    setCurrentPage(0);
    setTotalPages(0);
    setTotalCount(0);
    setHasNext(false);
    setHasPrevious(false);
  }, []);

  // Initial load
  useEffect(() => {
    if (initialLoad && items.length === 0 && currentPage === 0) {
      loadPage(1, false);
    }
  }, [initialLoad, items.length, currentPage, loadPage]);

  return {
    items,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      hasNext,
      hasPrevious,
    },
    loadMore,
    refresh,
    reset,
  };
}
