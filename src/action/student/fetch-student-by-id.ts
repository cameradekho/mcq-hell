"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { IStudent, studentCollectionName } from "@/models/student";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type FetchStudentByIdResult = ServerActionResult<IStudent>;

export type FetchStudentByIdData = {
  studentId: string;
};

export const fetchStudentById = async (
  data: FetchStudentByIdData
): Promise<FetchStudentByIdResult> => {
  try {
    const { studentId } = data;

    if (!studentId) {
      return {
        success: false,
        message: "Please provide studentId.....",
      };
    }

    await mongodb.connect();

    const student = await mongodb
      .collection<IStudent>(studentCollectionName)
      .findOne(new ObjectId(studentId));

    if (!student) {
      return {
        success: false,
        message: "Student not found",
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
