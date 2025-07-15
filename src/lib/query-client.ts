import {
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 3000,
      refetchOnWindowFocus: false,
    },
  },
});

export const invalidateQueries = (
  filters?: InvalidateQueryFilters,
  options?: InvalidateOptions
) => queryClient.invalidateQueries(filters, options);

export const invalidateMultipleQueries = (
  filters: InvalidateQueryFilters,
  options?: InvalidateOptions
) => {
  if (!filters.queryKey || !Array.isArray(filters.queryKey)) {
    return Promise.resolve();
  }

  return Promise.all(
    filters.queryKey.map((key) =>
      queryClient.invalidateQueries({ ...filters, queryKey: [key] }, options)
    )
  );
};
