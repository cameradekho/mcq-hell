import { parseMessage } from "@/lib/message-parser";
import { TMessage } from "@/types/message";
import { Markdown } from "../markdown";
import { AssistantQuestionList } from "./assistant-question-list";
import { IQuestion } from "@/models/exam";

type AssistantMessageProps = {
  message: TMessage;
};

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  return (
    <div className="group prose prose-neutral flex w-full max-w-3xl flex-col gap-2 dark:prose-invert">
      {message.content.map((part, index) => {
        if (part.type === "text") {
          return <Markdown key={index} text={part.text} />;
        }

        if (part.type === "tag") {
          return (
            <AssistantQuestionList
              key={index}
              text={part.text as IQuestion[]}
            />
          );
        }
      })}
    </div>
  );
};