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
  image: string;
  correctOptionId: string[];
  correctOption: IAnswerOption[];
  selectedOptionId: string[];
  selectedOption: IAnswerOption[];
  isCorrect: boolean;
};
type ExamAttempt = {
  examId: string;
  teacherEmail: string;
  responses: StudentAnswer[];
  score: {
    scored: number;
    submittedAt: Date;
  };
};

export type IStudentResponseDocument = {
  _id: string;
  // studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  examAttempts?: ExamAttempt[];
  createdAt: Date;
  updatedAt: Date;
};

export const studentResponseCollectionName = "student-response";
