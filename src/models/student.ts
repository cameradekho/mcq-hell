export type IStudents = {
  _id?: string;
  name: string;
  role: "student";
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
};

export const studentCollectionName = "student";
