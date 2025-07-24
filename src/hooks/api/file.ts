import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  TApiPromise,
  TMutationOpts,
  TPaginationQParams,
  TQueryOpts,
} from "@/types/api";
import { api } from "@/lib/api";
import { TFile } from "@/types/file";

// Base URL: /api/v1/file/...

// File Types

type TFileId = {
  fileId: string;
};

type TGetFileByIdResponse = {
  file: TFile<string>;
};

type TUpdateFileByIdPayload = {
  name?: string;
};

type TGetAllFilesQParams = TPaginationQParams;

// File Services

const getAllFiles = (
  params: TGetAllFilesQParams = {}
): TApiPromise<TFile<string>[]> => {
  return api.get("/file", { params });
};

const getFileById = ({
  fileId,
  ...params
}: TFileId): TApiPromise<TGetFileByIdResponse> => {
  return api.get(`/file/${fileId}`, { params });
};

const updateFileById = ({
  fileId,
  ...payload
}: TFileId & TUpdateFileByIdPayload): TApiPromise<TFile> => {
  return api.put(`/file/${fileId}`, payload);
};

const deleteFileById = ({ fileId }: TFileId): TApiPromise<TFile> => {
  return api.delete(`/file/${fileId}`);
};

// File Hooks

export const useGetAllFiles = (
  params: TGetAllFilesQParams = {},
  options?: TQueryOpts<TFile<string>[]>
) => {
  return useQuery({
    queryKey: ["useGetAllFiles", params],
    queryFn: () => getAllFiles(params),
    ...options,
  });
};

export const useGetFileById = (
  params: TFileId,
  options?: TQueryOpts<TGetFileByIdResponse>
) => {
  return useQuery({
    queryKey: ["useGetFileById", params],
    queryFn: () => getFileById(params),
    ...options,
  });
};

export const useUpdateFileById = (
  options?: TMutationOpts<TUpdateFileByIdPayload, TFile>
) => {
  return useMutation({
    mutationKey: ["useUpdateFileById"],
    mutationFn: updateFileById,
    ...options,
  });
};

export const useDeleteFileById = (options?: TMutationOpts<TFileId, TFile>) => {
  return useMutation({
    mutationKey: ["useDeleteFileById"],
    mutationFn: deleteFileById,
    ...options,
  });
};
