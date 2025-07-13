import { useEffect, useState } from "react";
import { CoreAssistantMessage, CoreMessage } from "ai";

import { env } from "@/constants/env";
import { generateMongoId } from "@/lib/generate-mongo-id";
import { SSE_EVENTS } from "@/constants/sse-events";

type TPayload = {
  conversation_id: string;
  user_message: string;
};

const READER_CONTINUE = true;

export const useSSE = () => {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    console.log("currentMessage", currentMessage);
  }, [currentMessage]);

  const submitMessage = async (payload: TPayload) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "",
        content: payload.user_message,
      },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_BACKEND_URL}/conversation/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            conversation_id: payload.conversation_id,
            user_message: payload.user_message,
          }),
        }
      );

      const reader = response.body?.getReader();

      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader found.");

      let buffer = "";

      while (READER_CONTINUE) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const completeEvents = buffer.split("\n\n");

        buffer = completeEvents.pop() || "";

        for (const eventChunk of completeEvents) {
          const events = eventChunk.split("\n").filter((line) => line.trim());

          events.forEach((eventData) => {
            try {
              let jsonData = eventData;
              if (eventData.startsWith("data: ")) {
                jsonData = eventData.slice(6);
              }

              const parsedEvent = JSON.parse(jsonData);

              switch (parsedEvent.event) {
                case SSE_EVENTS.CHAT_CHUNK:
                  if (!isStreaming) {
                    setIsStreaming(true);
                  }
                  setCurrentMessage((prev) => [...prev, parsedEvent.data.text]);
                  break;

                case SSE_EVENTS.CHAT_ERROR:
                  setIsStreaming(false);
                  break;

                case SSE_EVENTS.CHAT_COMPLETE:
                  setIsStreaming(false);
                  break;

                default:
                  console.warn("Unknown event type:", parsedEvent);
                  break;
              }
            } catch (e) {
              console.warn("Error parsing event:", eventData, e);
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    isStreaming,
    messages,
    currentMessage,
    setMessages,
    submitMessage,
  };
};
