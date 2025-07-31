// provider to create exam from the AI response
"use client";

import { IQestionProps } from "@/components/questions";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type TQuestionContextType = {
  isAIQuestionExists: boolean;
  setIsAIQuestionExists: Dispatch<SetStateAction<boolean>>;
  questions: IQestionProps[];
  setQuestions: Dispatch<SetStateAction<IQestionProps[]>>;
};

const QuestionContext = createContext<TQuestionContextType | undefined>(
  undefined
);

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [isAIQuestionExists, setIsAIQuestionExists] = useState<boolean>(false);
  const [questions, setQuestions] = useState<IQestionProps[]>([]);
  return (
    <QuestionContext.Provider
      value={{
        isAIQuestionExists,
        setIsAIQuestionExists,
        questions,
        setQuestions,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionContext must be used within a QuestionProvider"
    );
  }
  return context;
};
