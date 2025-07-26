import { ObjectId } from "mongodb";
import { IExam } from "./exam";
import { IStudent } from "./student";

export type ITeacher = {
  _id?: ObjectId;
  role: "teacher";
  name: string;
  email: string;
  avatar: string;
  // exam: IExam[];
  createdAt: Date;
  updatedAt: Date;
};

export type IUser<T extends "teacher" | "student"> = T extends "teacher"
  ? ITeacher & { role: "teacher" }
  : IStudent & { role: "student" };

export const teacherCollectionName = "teacher";
