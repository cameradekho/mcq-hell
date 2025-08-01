import { memo } from "react";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";

import { AssistantMessage } from "@/components/message/assistant-message";
import { UserMessage } from "@/components/message/user-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TMessage } from "@/types/message";

type MessageListProps = {
  messages: TMessage[];
};

const MessageListComponent = ({ messages }: MessageListProps) => {
  console.log("IN MESSAGE LIST:", messages);
  return (
    <div className="flex w-full flex-col gap-6 text-sm">
      {messages?.map((message, index) => {
        return (
          <div
            key={`message-${index}`}
            className={cn(
              "relative flex w-full flex-col gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {message.role === "user" && (
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            )}
            {message.role === "user" ? (
              <UserMessage message={message} />
            ) : (
              <AssistantMessage message={message} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
