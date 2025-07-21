import { ObjectId } from "mongodb";

export type IStudent = {
  _id: ObjectId;
  name: string;
  role: "student";
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
};

export const studentCollectionName = "student";
