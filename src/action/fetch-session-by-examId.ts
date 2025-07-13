"use server"
import { IExam, ISession } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "./fetch-teacher-by-id";
import { mongodb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type FetchSessionByExamIdResult = ServerActionResult<ISession | undefined>;

export type FetchSessionByExamIdData = {
  examId: string;
  teacherId: string;
};

export const fetchSessionByExamId = async (
  data: FetchSessionByExamIdData
): Promise<FetchSessionByExamIdResult> => {
  try {
    const { examId, teacherId } = data;
    if (!examId || !teacherId) {
      return {
        success: false,
        message: "Please provide examId and teacherEmail",
      };
    }

    const teacherData = await fetchTeacherById({ teacherId: data.teacherId });

    if (!teacherData.success) {
      return {
        success: false,
        message: teacherData.message || "Failed to fetch teacher",
      };
    }

    await mongodb.connect();
    const sessionData = await mongodb.collection<IExam>("exam").findOne({
      _id: new ObjectId(data.examId),
      createdByEmail: teacherData.data.email,
    });

    if (!sessionData) {
      return {
        success: false,
        message: "No exam found",
      };
    }
    return {
      success: true,
      data: sessionData.session || undefined,
      message: "Session fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error fetching exam's session: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
