"use server";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "./fetch-teacher-by-id";
import { mongodb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IExamSession } from "@/models/teacher-exam-session";

export type FetchSessionByExamIdResult = ServerActionResult<IExamSession>;

export type FetchSessionByExamIdData = {
  examId: string;
  teacherId: string;
};

export const fetchExamSessionByExamId = async (
  data: FetchSessionByExamIdData
): Promise<FetchSessionByExamIdResult> => {
  try {
    const { examId, teacherId } = data;
    if (!examId || !teacherId) {
      return {
        success: false,
        message: "Please provide examId and teacherId",
      };
    }

    const teacherData = await fetchTeacherById({ teacherId: data.teacherId });

    if (!teacherData.success) {
      return {
        success: false,
        message: teacherData.message || "Teacher not found",
      };
    }

    await mongodb.connect();

    const sessionData = await mongodb
      .collection<IExamSession>(`examSession`)
      .findOne({
        examId: new ObjectId(examId),
        teacherId: new ObjectId(teacherId),
      });

    if (!sessionData) {
      return {
        success: false,
        message: "Please create a new Session",
      };
    }
    return {
      success: true,
      data: sessionData,
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
