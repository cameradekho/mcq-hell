import { ObjectId } from "mongodb";

export type IExamSession = {
  _id?: ObjectId;
  examId: ObjectId;
  teacherId: ObjectId;
  sessionDate: Date;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
};

export const examsessionCollectionName = "examSession";
