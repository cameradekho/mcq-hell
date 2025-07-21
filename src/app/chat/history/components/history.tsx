"use client";


import { format } from "date-fns";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { useQueryParams } from "@/hooks/custom/use-query-params";
import { useGetAllConversations } from "@/hooks/api/conversation";
import { Pagination } from "@/components/pagination";


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
          {conversations.data.map((conversation) => (
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
