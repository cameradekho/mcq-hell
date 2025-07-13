"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";
import { toast } from "sonner";
import { teacherCollectionName } from "@/models/teacher";
import { examCollectionName } from "@/models/exam";

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

    await mongodb.connect();

    const deleteRes = await mongodb.collection(examCollectionName).updateOne(
      {
        _id: new ObjectId(examId),
        createdByEmail: existingTeacher.data.email,
      },
      {
        $unset: {
          session: "",
        },
      }
    );

    if (!deleteRes.acknowledged) {
      return {
        success: false,
        message: "Error deleting exam by id...",
      };
    }

    if (deleteRes.modifiedCount === 0) {
      return {
        success: false,
        message: "No exam was deleted. Please check the exam ID.",
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
