import { motion } from "framer-motion";
import { FileIcon } from "lucide-react";

import type { TMessage } from "@/types/message";
import { cn } from "@/lib/utils";

import { Markdown } from "@/components/markdown";

type UserMessageProps = {
  message: TMessage;
};

export const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "group relative flex flex-col items-end gap-2 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/20 to-primary/10 px-4 py-1.5 prose-a:text-blue-500",
        )}
      >
        <Markdown text={message.content[0].text} />
      </div>
    </div>
  );
};
