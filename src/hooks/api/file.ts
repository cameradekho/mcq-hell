import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  TApiPromise,
  TMutationOpts,
  TPaginationQParams,
  TQueryOpts,
} from "@/types/api";
import { api } from "@/lib/api";
import { TFile } from "@/types/file";

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

type TFileUploadPayload = {
  file: File;
  userId: string;
};

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
  return api.delete(`/file/${fileId}}`);
};

const uploadFile = (payload: TFileUploadPayload): TApiPromise<TFile> => {
  return api.post("/file", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

export const useUploadFile = (
  options?: TMutationOpts<TFileUploadPayload, TFile>
) => {
  return useMutation({
    mutationKey: ["useUploadFile"],
    mutationFn: uploadFile,
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
