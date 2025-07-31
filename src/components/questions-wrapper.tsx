"use client";

import { Questions } from "@/components/questions";
import { useQuestionContext } from "@/providers/question-provider";

export const QuestionsWrapper = () => {
  const { isAIQuestionExists, questions } = useQuestionContext();
  return (
    <>
      {isAIQuestionExists && questions.length > 0 ? (
        <Questions text={questions} />
      ) : (
        <Questions />
      )}
    </>
  );
};
