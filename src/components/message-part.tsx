import type { TMessagePart } from "@/types/message";

import { Markdown } from "@/components/markdown";
import { AssistantQuestionList } from "./message/assistant-question-list";

type MessagePartProps = {
  part: TMessagePart;
};

export const MessagePart = ({ part }: MessagePartProps) => {
  if (part.type === "text") {
    return (
      <div>
        <span>MessagePart: {typeof part.text}</span>
        <Markdown text={part.text} />
      </div>
    );
  }

  if (part.type === "tag") {
    return <div>{typeof part.text}</div>;
    // const questionsArray = [{ question: part.text }];
    // return <AssistantQuestionList questions={questionsArray} />;
  }

  return null;
};
