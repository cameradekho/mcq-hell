import { ObjectId } from "mongodb";

export type StudentExamPermision = {
  _id: ObjectId;
  studentId: ObjectId;
  examId: ObjectId;
  teacherId: ObjectId;
  
  status: "not-started" | "started" | "completed" | "block";
  createdAt: Date;
  updatedAt: Date;
};
