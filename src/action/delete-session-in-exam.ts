"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";
import { toast } from "sonner";
import { teacherCollectionName } from "@/models/teacher";

export type DeleteExamByIdResult = ServerActionResult<undefined>;

type DeleteExamByIdData = {
  examId: string;
  teacherId: string;
};

export const deleteSessionInExam = async (
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
    const teacherObjectId = new ObjectId(teacherId);

    const existingTeacher = await fetchTeacherById({
      teacherId: teacherId,
    });

    if (!existingTeacher.success) {
      return {
        success: false,
        message: existingTeacher.message,
      };
    }

    const existingExam = existingTeacher.data.exam.find(
      (exam) => exam.id === examId
    );

    if (!existingExam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    const result = await mongodb.collection(teacherCollectionName).updateOne(
      {
        _id: teacherObjectId,
        "exam.id": examId,
      },
      {
        $unset: {
          "exam.$.session": "",
        },
      }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: "No session found to delete",
      };
    }

    if (!result.acknowledged) {
      return {
        success: false,
        message: "Error deleting session",
      };
    }
    return {
      success: true,
      data: undefined,
      message: "Session deleted successfully",
    };

    await mongodb.connect();
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error deleting exam by id: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
