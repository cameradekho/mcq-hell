import type { TMessagePart } from "@/types/message";

import { Markdown } from "@/components/markdown";

type MessagePartProps = {
  part: TMessagePart;
};

export const MessagePart = ({ part }: MessagePartProps) => {
  if (part.type === "text") {
    return <Markdown text={part.text} />;
  }

  if (part.type === "tag") {
      return <div>Questions</div>;
  }

  return null;
};
