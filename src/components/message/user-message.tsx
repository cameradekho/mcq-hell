import type { TMessage } from "@/types/message";
import { cn } from "@/lib/utils";

import { Markdown } from "@/components/markdown";
import { parseMessage } from "@/lib/message-parser";

type UserMessageProps = {
  message: TMessage;
};

export const UserMessage = ({ message }: UserMessageProps) => {
  const messageParts = parseMessage(message.content[0].text as string);

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "group relative flex flex-col items-end gap-2 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/20 to-primary/10 px-4 py-1.5 prose-a:text-blue-500"
        )}
      >
        {messageParts.map((part, index) => {
          if (part.type === "text") {
            return <Markdown key={index} text={part.text} />;
          }
        })}
      </div>
    </div>
  );
};
