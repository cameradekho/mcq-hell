import { IExam } from "./exam";

export type IStudentResult = {
  studentId: string;
  studentName: string;
  results: string[];
};

export type IExamResult = {
  examId: IExam["_id"];
  examName: IExam["name"];
  students: IStudentResult[];
};

export type IResult = {
  id: string;
  teacherId: string;
  results: IExamResult[];
  createdAt: Date;
  updatedAt: Date;
};

export const resultcollectionName = "result";
