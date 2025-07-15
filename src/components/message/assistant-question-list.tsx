"use client";

import React from "react";

type Question = {
  question: string;
};

type AssistantQuestionListProps = {
  text: Record<string, any>;
};

export const AssistantQuestionList: React.FC<AssistantQuestionListProps> = ({
  text,
}) => {
  console.log("text", text);
  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Questions:</h2>
      <ul className="list-disc list-inside space-y-1">
        {text.map((item: Question, index: number) => (
          <li key={index} className="text-gray-800">
            {item.question}
          </li>
        ))}
      </ul>
    </div>
  );
};
