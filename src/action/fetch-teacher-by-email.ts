"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ITeacher, teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";

export type FetchTeacherByEmailResult = ServerActionResult<
  Pick<ITeacher, "_id" | "name" | "email" | "avatar">
>;

export type FetchTeacherByEmailData = {
  email: string;
};

export const fetchTeacherByEmail = async (
  data: FetchTeacherByEmailData
): Promise<FetchTeacherByEmailResult> => {
  try {
    if (!data.email) {
      return {
        success: false,
        message: "Please provide teacher's email",
      };
    }

    await mongodb.connect();
    const teacher = await mongodb.collection(teacherCollectionName).findOne({
      email: data.email,
    });

    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    return {
      success: true,
      data: {
        _id: teacher?._id,
        name: teacher?.name,
        email: teacher?.email,
        avatar: teacher?.avatar,
      },
      message: "Teacher found",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error fetching teacher",
    };
  }
};
