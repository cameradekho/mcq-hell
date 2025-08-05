import { TMessagePart } from "@/types/message";

export const parseMessage = (message: string): TMessagePart[] => {
  const parts: TMessagePart[] = [];

  // Find QUESTIONS tag content
  const questionsMatch = message.match(
    /<QUESTIONS>\s*([\s\S]*?)\s*<\/QUESTIONS>/
  );

  if (questionsMatch) {
    const beforeQuestions = message.substring(0, questionsMatch.index);
    const questionsContent = questionsMatch[1].trim();
    const afterQuestions = message.substring(
      questionsMatch?.index! + questionsMatch[0].length
    );

    // Add text before questions
    if (beforeQuestions.trim()) {
      parts.push({
        type: "text",
        text: beforeQuestions.trim(),
      });
    }

    // Parse and add questions
    try {
      const parsedQuestions = JSON.parse(questionsContent);
      parts.push({
        type: "tag",
        text: parsedQuestions,
      });
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Content:", questionsContent);

      parts.push({
        type: "text",
        text: `JSON Parse Error: ${questionsContent}`,
      });
    }

    // Add text after questions
    if (afterQuestions.trim()) {
      parts.push({
        type: "text",
        text: afterQuestions.trim(),
      });
    }
  } else {
    // No QUESTIONS tag found, treat entire message as text
    if (message.trim()) {
      parts.push({
        type: "text",
        text: message.trim(),
      });
    }
  }

  return parts;
};

type ParsedPart = { type: "text" | "latex"; content: string };

export function splitQuestionBySpecialTag(questionText: string): ParsedPart[] {
  if (!questionText) {
    return [];
  }

  const parts: ParsedPart[] = [];

  // More flexible regex that handles various quote escaping scenarios
  const regex = /<SPECIAL_TAG>(.*?)<\/SPECIAL_TAG>/gi;

  let lastIndex = 0;
  let match;

  // questionText.replace(/\\\\/g, "\\");

  while ((match = regex.exec(questionText)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      const textContent = questionText.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({
          type: "text",
          content: textContent,
        });
      }
    }

    // Add the LaTeX content (decode any escaped characters)
    const latexContent = match[1];
    parts.push({
      type: "latex",
      content: latexContent,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last tag
  if (lastIndex < questionText.length) {
    const remainingText = questionText.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({
        type: "text",
        content: remainingText,
      });
    }
  }

  // If no SPECIAL_TAG found, return the entire text as a text part
  if (parts.length === 0 && questionText.trim()) {
    parts.push({
      type: "text",
      content: questionText,
    });
  }

  return parts;
}
