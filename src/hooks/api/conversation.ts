import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  TApiPromise,
  TMutationOpts,
  TPaginationQParams,
  TQueryOpts,
} from "@/types/api";
import { api } from "@/lib/api";
import { TConversation, TMessage } from "@/types/message";

// Base URL: /api/v1/conversation/...

// Conversation Types

type TConversationId = {
  conversationId: string;
};

type TGetConversationByIdResponse = {
  conversation: TConversation<string>;
  messages: TMessage[];
};

type TUpdateConversationByIdPayload = {
  name?: string;
};

type TGetAllConversationsQParams = TPaginationQParams;

// Conversation Services

const getAllConversations = (
  params: TGetAllConversationsQParams = {}
): TApiPromise<TConversation<string>[]> => {
  return api.get("/conversation", { params });
};

const getConversationById = ({
  conversationId,
  ...params
}: TConversationId): TApiPromise<TGetConversationByIdResponse> => {
  console.log("Hubba calling main promise, ", conversationId);
  return api.get(`/conversation/${conversationId}`, { params });
};

const updateConversationById = ({
  conversationId,
  ...payload
}: TConversationId &
  TUpdateConversationByIdPayload): TApiPromise<TConversation> => {
  return api.put(`/conversation/${conversationId}`, payload);
};

const deleteConversationById = ({
  conversationId,
}: TConversationId): TApiPromise<TConversation> => {
  return api.delete(`/conversation/${conversationId}`);
};

// Conversation Hooks

export const useGetAllConversations = (
  params: TGetAllConversationsQParams = {},
  options?: TQueryOpts<TConversation<string>[]>
) => {
  return useQuery({
    queryKey: ["useGetAllConversations", params],
    queryFn: () => getAllConversations(params),
    ...options,
  });
};

export const useGetConversationById = (
  params: TConversationId,
  options?: TQueryOpts<TGetConversationByIdResponse>
) => {
  console.log("Hubba calling conversationId", params);
  return useQuery({
    queryKey: ["useGetConversationById", params],
    queryFn: () => getConversationById(params),
    ...options,
  });
};

export const useUpdateConversationById = (
  options?: TMutationOpts<TUpdateConversationByIdPayload, TConversation>
) => {
  return useMutation({
    mutationKey: ["useUpdateConversationById"],
    mutationFn: updateConversationById,
    ...options,
  });
};

export const useDeleteConversationById = (
  options?: TMutationOpts<TConversationId, TConversation>
) => {
  return useMutation({
    mutationKey: ["useDeleteConversationById"],
    mutationFn: deleteConversationById,
    ...options,
  });
};
