import { ObjectId } from "mongodb";

export type IAnswer = { id: string } & (
  | { textAnswer: string; image?: string }
  | { textAnswer?: string; image: string }
  | { textAnswer: string; image: string }
) & {
    isCorrect: boolean;
  };

export type IQuestion = {
  id: string;
  question: string;
  image: string;
  options: IAnswer[];
  answer: IAnswer["id"][];
  createdAt: Date;
  updatedAt: Date;
};

export type ISession = {
  _id?: ObjectId;
  sessionDate: Date;
  startTime: string | null;
  endTime: string | null;
  // isLive: boolean;
  createdAt: Date;
};

export type IExam = {
  id: string;
  createdBy?: string;
  createdByEmail?: string;
  name: string;
  description: string;
  duration: number;
  questions: IQuestion[];
  session?: ISession;
  createdAt: Date;
  updatedAt: Date;
};

export const examCollectionName = "exam";
