"use client";

import { SearchBar } from "@/components/search-bar";
import { Pagination } from "@/components/pagination";
import { useGetAllConversations } from "@/hooks/api/conversation";
import { useQueryParams } from "@/hooks/custom/use-query-params";
import React from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const HistoryPage = () => {
  const { params, updateParam } = useQueryParams();

  const { data: conversations, isLoading: isLoadingConversations } =
    useGetAllConversations({
      page: params.page,
      search: params.search,
      limit: 15,
    });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 w-full">
      <SearchBar
        searchParamKey="search"
        placeholder="Search conversations"
        value={params.search}
      />
      {conversations?.data ? (
        <div className="flex flex-col gap-4">
          {conversations?.data?.map((conversation) => (
            <Link
              key={conversation._id}
              href={`/chat/${conversation._id}`}
              className="flex flex-col gap-2 p-4 border rounded-md"
            >
              <div className="text-sm text-gray-500">
                {conversation.name || "Untitled"}
              </div>
              <div className="text-sm text-gray-500">
                {format(conversation.createdAt, "MMM d, yyyy")}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}
      <Pagination
        pagination={conversations?.pagination}
        onChange={(page) => updateParam("page", page.toString())}
        isLoading={isLoadingConversations}
      />
    </div>
  );
};

export default HistoryPage;
