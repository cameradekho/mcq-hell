"use server";
import { mongodb } from "@/lib/mongodb";
import { IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";

export type FetchExamByIdResult = ServerActionResult<IExam>;

export type FetchExamByIdData = {
  teacherId: string;
  examId: string;
};

export const fetchExamById = async (
  data: FetchExamByIdData
): Promise<FetchExamByIdResult> => {
  try {
    if (!data.examId || !data.teacherId) {
      return {
        success: false,
        message: "Please provide examId and teacherId",
      };
    }

    console.log(data.examId);

    const teacherData = await fetchTeacherById({ teacherId: data.teacherId });
    if (!teacherData.success || !teacherData.data) {
      return {
        success: false,
        message: "Error fetching teacher",
      };
    }

    await mongodb.connect();
    const examData = await mongodb.collection<IExam>("exam").findOne({
      _id: new ObjectId(data.examId),
      teacherId: new ObjectId(data.teacherId),
    });

    if (!examData) {
      return {
        success: false,
        message: "Exam not found",
      };
    }
    return {
      success: true,
      data: examData,
      message: "Exam found",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error fetching exam",
    };
  }
};
