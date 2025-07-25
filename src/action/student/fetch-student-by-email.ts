"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { IStudent, studentCollectionName } from "@/models/student";
import { ServerActionResult } from "@/types";

export type FetchStudentByEmailResult = ServerActionResult<IStudent>;

export type FetchStudentByEmailData = {
  studentEmail: string;
};

export const fetchStudentByEmail = async (
  data: FetchStudentByEmailData
): Promise<FetchStudentByEmailResult> => {
  try {
    if (!data.studentEmail) {
      return {
        success: false,
        message: "Please provide studentEmail$###",
      };
    }

    await mongodb.connect();

    const student = await mongodb
      .collection<IStudent>(studentCollectionName)
      .findOne({ email: data.studentEmail });

    if (!student) {
      return {
        success: false,
        message: "Student not found...",
      };
    }

    return {
      success: true,
      data: student,
      message: "Student fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error fetching student",
    };
  }
};
