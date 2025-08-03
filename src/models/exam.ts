import { ObjectId } from "mongodb";

type IQuestionfromAI = {
  textAnswer?: string;
  mathExpression?: string;
};

export type IAnswer = { _id: ObjectId } & (
  | { textAnswer: IQuestionfromAI[]; image?: string }
  | { textAnswer?: IQuestionfromAI[]; image: string }
  | { textAnswer: IQuestionfromAI[]; image: string }
) & {
    isCorrect: boolean;
  };

export type IQuestion = {
  _id: ObjectId;
  question: IQuestionfromAI[];
  image?: string;
  options: IAnswer[];
  answer: IAnswer["_id"][];
  createdAt: Date;
  updatedAt: Date;
};

export type IExam = {
  _id?: ObjectId;
  teacherId: ObjectId;
  name: string;
  description: string;
  duration: number;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
};

export const examCollectionName = "exam";
