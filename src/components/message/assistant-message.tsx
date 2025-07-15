import { parseMessage } from "@/lib/message-parser";
import { TMessage } from "@/types/message";
import { MessagePart } from "../message-part";

type AssistantMessageProps = {
  message: TMessage;
};

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  console.log("$$$$$message.content", message.content);

  return (
    <div className="group prose prose-neutral flex w-full max-w-3xl flex-col gap-2 dark:prose-invert">
      <span className=" text-xl text-green-600">hello Hubba yoooo man</span>
      {message.content.map((part, index) => {
        if (part.type === "text") {
          return (
            <MessagePart key={`${message.conversation}-${index}`} part={part} />
          );
        }

        if (part.type === "tag") {
          return (
            <MessagePart key={`${message.conversation}-${index}`} part={part} />
          );
        }
      })}
    </div>
  );
};
