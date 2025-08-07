"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";
import {
  examsessionCollectionName,
  IExamSession,
} from "@/models/teacher-exam-session";
import { deleteStudentExamSessionByTeachIdExamId } from "./session/student/delete-student-exam-session-by-teacherId-examId";

export type DeleteExamByIdResult = ServerActionResult<undefined>;

type DeleteExamByIdData = {
  examId: string;
  teacherId: string;
};

export const deleteExamSession = async (
  props: DeleteExamByIdData
): Promise<DeleteExamByIdResult> => {
  try {
    if (!props.examId) {
      return {
        success: false,
        message: "Please provide examId",
      };
    }

    const examId = props.examId;
    const teacherId = props.teacherId;

    if (!teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }

    const existingTeacher = await fetchTeacherById({
      teacherId: teacherId,
    });

    if (!existingTeacher.success) {
      return {
        success: false,
        message: existingTeacher.message,
      };
    }

    await mongodb.connect();

    const deleteRes = await mongodb
      .collection<IExamSession>(examsessionCollectionName)
      .deleteOne({
        _id: new ObjectId(examId),
        teacherId: new ObjectId(teacherId),
      });

    if (!deleteRes.acknowledged) {
      return {
        success: false,
        message: "Error deleting exam by id...",
      };
    }

    if (deleteRes.deletedCount === 0) {
      return {
        success: false,
        message: "No exam session found with the provided examId and teacherId",
      };
    }

    const deleteResStudentSession =
      await deleteStudentExamSessionByTeachIdExamId({
        teacherId: teacherId,
        examId: examId,
      });

    if (!deleteResStudentSession.success) {
      return {
        success: false,
        message: "pro--->"+deleteResStudentSession.message,
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Session deleted successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error deleting exam session by id: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
