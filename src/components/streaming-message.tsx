import { parseMessage } from "@/lib/message-parser";
import { AssistantQuestionList } from "./message/assistant-question-list";
import { IQuestion } from "@/models/exam";

export const StreamingMessage = ({
  currentMessage,
}: {
  currentMessage: string[];
}) => {
  if (!currentMessage.length) return null;

  const fullMessage = currentMessage.join("");
  const parts = parseMessage(fullMessage);

  return (
    <div className=" w-full flex justify-start bg-orange-400">
      <div className="rounded-lg w-full break-words">
        <div className="flex flex-col gap-2 text-sm">
          {parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <span
                  key={`streaming-${index}`}
                  className="whitespace-pre-wrap"
                >
                  {part.text as string}
                </span>
              );
            }

            if (part.type === "tag") {
              return (
                <span
                  key={`streaming-${index}`}
                  className="whitespace-pre-wrap bg-gray-100"
                >
                  <AssistantQuestionList text={part.text as IQuestion[]} />
                </span>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
