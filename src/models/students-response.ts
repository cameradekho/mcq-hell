import { IAnswer } from "./exam";

export type IAnswerOption = {
  id: string; // not optionId
  content: {
    text?: string[];
    image?: string[];
  };
};

export type StudentAnswer = {
  questionId: string;
  question: string;
  image?: string;
  correctOption: IAnswerOption[];
  selectedOption: IAnswerOption[];
  isCorrect: boolean;
};

export type IStudentResponseDocument = {
  _id?: string;
  examId: string;
  studentId: string;
  teacherId: string;
  responses: StudentAnswer[];
  scored: number;
  createdAt: Date;
  updatedAt: Date;
};

export const studentResponseCollectionName = "student-response";
