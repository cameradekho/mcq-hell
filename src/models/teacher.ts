import { IExam } from "./exam";

export type ITeacher = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  exam: IExam[];
  createdAt: Date;
  updatedAt: Date;
};

export const teacherCollectionName = "teacher";
