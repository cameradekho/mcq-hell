import type { TMessagePart } from "@/types/message";

export const parseMessage = (message: string): TMessagePart[] => {
  const parts: TMessagePart[] = [];

  const questionsTagRegex = /(<QUESTIONS[^>]*>[\s\S]*?<\/QUESTIONS>)/g;
  const segments = message.split(questionsTagRegex);

  for (const segment of segments) {
    if (segment.startsWith("<QUESTIONS")) {
      const nameMatch = segment.match(/name="([^"]*)"/);

      const contentMatch = segment.match(
        /<QUESTIONS[^>]*>([\s\S]*?)<\/QUESTIONS>/
      );

      if (nameMatch && contentMatch) {
        const content = contentMatch[1];

        parts.push({
          type: "tag",
          name: nameMatch[1],
          data: JSON.parse(content),
        });
      }
    } else if (segment.trim()) {
      parts.push({
        type: "text",
        data: segment.trim(),
      });
    }
  }

  return parts;
};
