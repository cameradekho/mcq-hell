import { parseMessage } from "@/lib/message-parser";
import { AssistantQuestionList } from "./message/assistant-question-list";
import { IQuestion } from "@/models/exam";
import { Markdown } from "./markdown";

export const StreamingMessage = ({
  currentMessage,
}: {
  currentMessage: string[];
}) => {
  if (!currentMessage.length) return null;

  const fullMessage = currentMessage.join("");
  const parts = parseMessage(fullMessage);
  console.log("hubba =====>", parts);

  return (
    <div className=" w-full flex justify-start">
      <div className="rounded-lg w-full break-words">
        <div className="flex flex-col gap-2 text-sm">
          {parts.map((part, index) => {
            if (part.type === "text") {
              return <Markdown text={part.text} key={`streaming-${index}`} />;
            }

            if (part.type === "tag") {
              return (
                <span
                  key={`streaming-${index}`}
                  className="whitespace-pre-wrap"
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
