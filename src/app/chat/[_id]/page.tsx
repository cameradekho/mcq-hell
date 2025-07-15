"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useChatContext } from "@/providers/chat-provider";
import { ChatInput } from "@/components/chat-input";
import { useSSE } from "@/hooks/custom/use-sse";
import { MessageList } from "@/components/message-list";
import { generateMongoId } from "@/lib/generate-mongo-id";
import { StreamingMessage } from "@/components/streaming-message";
import { Loader2 } from "lucide-react";
import { useGetConversationById } from "@/hooks/api/conversation";

const ChatPage = () => {
  const params = useParams<{ _id: string }>();
  const router = useRouter();

  const { pendingMessage, setPendingMessage } = useChatContext();

  const { loading, messages, isStreaming, submitMessage, currentMessage } =
    useSSE();

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: errorConversation,
  } = useGetConversationById({
    conversationId: params._id,
  });

  useEffect(() => {
    console.log("conversationData", conversationData);
  }, [conversationData]);

  useEffect(() => {
    if (params._id !== "new" && pendingMessage) {
      submitMessage({
        conversation_id: params._id,
        user_message: pendingMessage,
      });
    }
    setPendingMessage(null);
  }, [params._id]);

  const handleSubmit = async (data: { message: string }) => {
    if (params._id === "new") {
      setPendingMessage(data.message);
      const newConversationId = await generateMongoId();
      router.replace(`/chat/${newConversationId}`);
    } else {
      submitMessage({
        conversation_id: params._id,
        user_message: data.message,
      });
    }
  };

  if (params._id === "new") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] mx-auto max-w-2xl px-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Start a New Conversation</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Type your message below to begin
          </p>
        </div>
        <ChatInput onSubmit={handleSubmit} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] mx-auto max-w-2xl px-4 w-full">
      <div className="flex-1 overflow-y-auto pb-32">
        {conversationData?.data?.messages && (
          <MessageList messages={conversationData?.data?.messages} />
        )}
        {isStreaming && <StreamingMessage currentMessage={currentMessage} />}
        {!isStreaming && loading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
      </div>
      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
};

export default ChatPage;
