import { IExam } from "./exam";

export type IStudents = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ITeacher = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  exam: IExam[];
  students?: IStudents[];
  createdAt: Date;
  updatedAt: Date;
};

export const teacherCollectionName = "teacher";
