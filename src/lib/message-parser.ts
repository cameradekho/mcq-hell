import type { TMessagePart } from "@/types/message";

export const parseMessage = (message: string): TMessagePart[] => {
  const parts: TMessagePart[] = [];

  // Updated regex to only match <QUESTIONS>...</QUESTIONS> (no attributes)
  const questionsTagRegex = /(<QUESTIONS>[\s\S]*?<\/QUESTIONS>)/g;
  const segments = message.split(questionsTagRegex);

  for (const segment of segments) {
    if (segment.startsWith("<QUESTIONS>")) {
      const contentMatch = segment.match(/<QUESTIONS>([\s\S]*?)<\/QUESTIONS>/);

      if (contentMatch) {
        const content = contentMatch[1];

        // console.log("content*********", JSON.parse(content));

        parts.push({
          type: "tag",
          text: JSON.parse(content),
        });
      }
    } else if (segment.trim()) {
      parts.push({
        type: "text",
        text: segment.trim(),
      });
    }
  }

  return parts;
};
