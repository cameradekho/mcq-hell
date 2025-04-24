export type IQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
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

// standard?: string;
// subject?: string;
