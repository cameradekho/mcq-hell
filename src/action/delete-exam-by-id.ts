"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { ObjectId } from "mongodb";
import { examCollectionName } from "@/models/exam";
import { get } from "http";
import { fetchTeacherById } from "./fetch-teacher-by-id";

export type DeleteExamByIdResult = ServerActionResult<undefined>;

type DeleteExamByIdData = {
  examId: string;
  teacherId: string;
};

export const deleteExamById = async (
  props: DeleteExamByIdData
): Promise<DeleteExamByIdResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to delete an exam",
      };
    }
    console.log(props.examId);
    if (!props.examId) {
      return {
        success: false,
        message: "Please provide examId",
      };
    }

    if (!props.teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }
    await mongodb.connect();

    const teacherDoc = await fetchTeacherById({
      teacherId: props.teacherId,
    });

    if (!teacherDoc.success) {
      return {
        success: false,
        message: teacherDoc.message,
      };
    }

    if (!teacherDoc) throw new Error("Teacher not found");

    const deleteRes = await mongodb.collection(examCollectionName).deleteOne({
      _id: new ObjectId(props.examId),
      createdByEmail: teacherDoc.data.email,
    });

    if (!deleteRes.acknowledged) {
      return {
        success: false,
        message: "Error deleting exam",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam deleted successfully",
    };
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
