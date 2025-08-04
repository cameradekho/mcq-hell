import { TMessagePart } from "@/types/message";

export const parseMessage = (message: string): TMessagePart[] => {
  const parts: TMessagePart[] = [];

  const questionsTagRegex = /(<QUESTIONS>[\s\S]*?<\/QUESTIONS>)/g;
  const segments = message.split(questionsTagRegex);

  for (const segment of segments) {
    if (segment.startsWith("<QUESTIONS>")) {
      const contentMatch = segment.match(/<QUESTIONS>([\s\S]*?)<\/QUESTIONS>/);

      if (contentMatch) {
        const content = contentMatch[1];

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

type ParsedPart = { type: "text" | "latex"; content: string };

export function splitQuestionBySpecialTag(question: string): ParsedPart[] {
  const regex = /<SPECIAL_TAG type="latex">(.*?)<\/SPECIAL_TAG>/g;
  const parts: ParsedPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(question)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: question.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: "latex",
      content: match[1],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < question.length) {
    parts.push({
      type: "text",
      content: question.slice(lastIndex),
    });
  }

  return parts;
}

