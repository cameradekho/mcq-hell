import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export type TApiPromise<TData = undefined> =
  | Promise<TApiSuccess<TData>>
  | Promise<TApiError>;

export type TQueryOpts<TResponse = undefined> = Omit<
  UseQueryOptions<TApiSuccess<TResponse>, TApiError>,
  "queryKey" | "queryFn"
>;

export type TMutationOpts<TVariables = void, TResponse = undefined> = Omit<
  UseMutationOptions<TApiSuccess<TResponse>, TApiError, TVariables>,
  "mutationKey" | "mutationFn"
>;

export type TApiSuccess<TData = undefined> = {
  message: string;
  data?: TData;
  pagination?: TPaginationResponse;
};

export type TApiError = {
  message: string;
  status_code: number;
};

export type TPaginationQParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type TPaginationResponse = {
  page: number;
  limit: number;
  total_pages: number;
  total_count: number;
};
