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
export type IExam = {
  id: string;
  name: string;
  description: string;
  duration: number;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
};

export const examCollectionName = "exam";
