import { ObjectId } from "mongodb";

export type IStudentExamSession = {
  _id?: ObjectId;
  studentId: ObjectId;
  examId: ObjectId;
  teacherId: ObjectId;
  examSessionId: ObjectId;
  status: "not-started" | "started" | "completed" | "block";
  createdAt: Date;
  updatedAt: Date;
};

export const studentExamSessionCollectionName = "studentExamSession";
