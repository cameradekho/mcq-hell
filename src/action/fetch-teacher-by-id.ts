"use server";

import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ITeacher } from "@/models/teacher";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type FetchTeacherByIdResult = ServerActionResult<
  Pick<
    ITeacher,
    | "_id"
    | "email"
    | "name"
    | "avatar"
    | "exam"
    | "students"
    | "createdAt"
    | "updatedAt"
  >
>;

export type FetchTeacherByIdData = {
  teacherId: string;
};

export const fetchTeacherById = async (
  data: FetchTeacherByIdData
): Promise<FetchTeacherByIdResult> => {
  try {
    const { teacherId } = data;

    if (!teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }

    await mongodb.connect();

    const teacherData = await mongodb.collection("teacher").findOne({
      _id: new ObjectId(teacherId),
    });

    if (!teacherData) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    return {
      success: true,
      data: {
        _id: teacherData._id, // ✅ fixed
        name: teacherData.name,
        email: teacherData.email,
        avatar: teacherData.avatar,
        exam: teacherData.exam,
        students: teacherData.students,
        createdAt: teacherData.createdAt,
        updatedAt: teacherData.updatedAt,
      },
      message: "Teacher found",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error fetching teacher",
    };
  }
};
