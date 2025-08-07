import type { TMessagePart } from "@/types/message";

import { Markdown } from "@/components/markdown";
import { AssistantQuestionList } from "./message/assistant-question-list";
import { IQuestion } from "@/models/exam";

type MessagePartProps = {
  part: TMessagePart;
};

export const MessagePart = ({ part }: MessagePartProps) => {
  if (part.type === "text") {
    return (
      <div>
        <Markdown text={part.text} />
      </div>
    );
  }

  if (part.type === "tag") {
    return <AssistantQuestionList text={part.text as IQuestion[]} />;
  }

  return null;
};
