import { ObjectId } from "mongodb";
import { IExam } from "./exam";
import { IStudents } from "./student";

export type ITeacher = {
  _id?: ObjectId;
  role: "teacher";
  name: string;
  email: string;
  avatar: string;
  exam: IExam[];
  students?: IStudents[];
  createdAt: Date;
  updatedAt: Date;
};

export type IUser<T extends "teacher" | "student"> = T extends "teacher"
  ? ITeacher & { role: "teacher" }
  : IStudents & { role: "student" };

export const teacherCollectionName = "teacher";
