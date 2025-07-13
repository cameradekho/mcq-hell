import { parseMessage } from "@/lib/message-parser";
import { TMessage } from "@/types/message";
import { MessagePart } from "../message-part";

type AssistantMessageProps = {
  message: TMessage;
};

export const AssistantMessage = ({ message }: AssistantMessageProps) => {









  return (
    <div
      className="group prose prose-neutral flex w-full max-w-3xl flex-col gap-2 dark:prose-invert"
    >

      {message.content.map((content, contentIndex) => {
        if (content.type === "text") {
          const parsedContent = parseMessage(content.text);

          return (
            <div key={contentIndex}>
              {parsedContent.map((part, partIndex) => (
                <MessagePart
                  key={partIndex}
                  part={part}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
