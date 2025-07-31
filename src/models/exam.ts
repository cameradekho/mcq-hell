import { ObjectId } from "mongodb";

export type IAnswer = { _id: ObjectId } & (
  | { textAnswer: string; image?: string }
  | { textAnswer?: string; image: string }
  | { textAnswer: string; image: string }
) & {
    isCorrect: boolean;
  };

export type IQuestion = {
  _id: ObjectId;
  question: string;
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
