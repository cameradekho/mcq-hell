"use client";

import React from "react";

type Question = {
  question: string;
};

type AssistantQuestionListProps = {
  text: string | { question: string }[]; 
};

const AssistantQuestionList: React.FC<AssistantQuestionListProps> = ({
  text,
}) => {
  let parsedQuestions: Question[] = [];

  try {
    console.log("typeof part.text:", typeof text);
    console.log("value of text:", text);

    if (typeof text === "string") {
      // Handle string with <QUESTIONS> tag
      const cleaned = text.replace(/<\/?QUESTIONS>/g, "").trim();
      parsedQuestions = JSON.parse(cleaned);
    } else if (Array.isArray(text)) {
      // It's already an object array
      parsedQuestions = text;
    } else {
      throw new Error("Unsupported text format");
    }
  } catch (error) {
    console.error("Invalid JSON format in AssistantQuestionList:", error);
    return <div className="text-red-500">Failed to load questions.</div>;
  }

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Questions:</h2>
      <ul className="list-disc list-inside space-y-1">
        {parsedQuestions.map((q, index) => (
          <li key={index} className="text-gray-800">
            {q.question}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssistantQuestionList;
