"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useChatContext } from "@/providers/chat-provider";
import { ChatInput } from "@/components/chat-input";
import { useSSE } from "@/hooks/custom/use-sse";
import { MessageList } from "@/components/message-list";
import { generateMongoId } from "@/lib/generate-mongo-id";
import { StreamingMessage } from "@/components/streaming-message";
import { Loader2, MessageCircle } from "lucide-react";
import { useGetConversationById } from "@/hooks/api/conversation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthButtons from "@/components/auth/auth-buttons";
import { FileSidebar } from "./components/file-sidebar";

const ChatPage = () => {
  const { data: session, status } = useSession();

  const params = useParams<{ _id: string }>();
  const router = useRouter();

  const {
    pendingMessage,
    setPendingMessage,
    selectedFileIds,
    setSelectedFileIds,
  } = useChatContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { messages, loading, isStreaming, submitMessage, currentMessage } =
    useSSE();

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: errorConversation,
  } = useGetConversationById(
    {
      conversationId: params._id,
    },
    {
      // enabled: params._id !== "new",
      enabled: !isStreaming,
    }
  );

  console.log("conversationData-->", conversationData);
  console.log("messages-->", messages);

  useEffect(() => {
    console.log("conversationData", conversationData);
  }, [conversationData]);

  useEffect(() => {
    if (params._id !== "new" && pendingMessage) {
      submitMessage({
        conversation_id: params._id,
        user_message: pendingMessage,
        file_ids: selectedFileIds,
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
        file_ids: selectedFileIds,
      });
    }
  };

  const handlePaperclipClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOpenChange = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
        <AuthButtons
          props={{
            signInbtnText: "Get Started Now",
            signOutbtnText: "Sign Out",
          }}
        />
      </div>
    );
  }

  if (params._id === "new") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] mx-auto max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Start a New Conversation</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Type your message below to begin
          </p>
        </div>
        <ChatInput
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
          onPaperclipClick={handlePaperclipClick}
          selectedFileIds={selectedFileIds}
        />
        <FileSidebar
          isOpen={isSidebarOpen}
          onOpenChange={handleSidebarOpenChange}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto w-full">
      <div className="pb-20 flex flex-col gap-4">
        {conversationData?.data?.messages && (
          <MessageList messages={conversationData.data.messages} />
        )}
        {isStreaming && <StreamingMessage currentMessage={currentMessage} />}
        {isStreaming && (
          <div className="flex justify-left items-center gap-2">
            <Loader2 className="size-4 animate-spin" />{" "}
            {loading?.loading_text || "Generating content..."}
          </div>
        )}
      </div>
      <div className="sticky bottom-6 flex flex-col gap-2 items-center">
        <Button size="sm" className="flex gap-2 items-center" asChild>
          <Link href="/chat/new">
            <MessageCircle className="size-4" />
            <span>New Chat</span>
          </Link>
        </Button>
        <ChatInput
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
          onPaperclipClick={handlePaperclipClick}
          selectedFileIds={selectedFileIds}
        />
      </div>
      <FileSidebar
        isOpen={isSidebarOpen}
        onOpenChange={handleSidebarOpenChange}
        selectedFileIds={selectedFileIds}
        setSelectedFileIds={setSelectedFileIds}
      />
    </div>
  );
};

export default ChatPage;
