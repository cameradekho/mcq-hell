"use server";
import { IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { mongodb } from "@/lib/mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";

export type IUpdateExamResult = ServerActionResult<undefined>;

export type UpdateExamData = {
  examId: string;
  teacherId: string;
  exam: Pick<IExam, "name" | "description" | "duration" | "questions">;
};

export async function updateExamByExamIdAndTeacherId(
  data: UpdateExamData
): Promise<IUpdateExamResult> {
  try {
    if (!data.examId || !data.teacherId || !data.exam) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }
    const teacher = await fetchTeacherById({ teacherId: data.teacherId });
    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    const examIndex =
      teacher.success &&
      teacher.data.exam.findIndex((e: IExam) => e.id === data.examId);

    if (examIndex === -1) {
      return {
        success: false,
        message: "Exam not found in teacher's exam list",
      };
    }

    const updatedExam = await mongodb.collection("teacher").updateOne(
      {
        id: data.teacherId,
        "exam.id": data.examId,
      },
      {
        $set: {
          "exam.$.name": data.exam.name,
          "exam.$.description": data.exam.description,
          "exam.$.duration": data.exam.duration,
          "exam.$.questions": data.exam.questions,
          "exam.$.updatedAt": new Date(),
        },
      }
    );

    console.log("Update result:", updatedExam);

    if (!updatedExam.acknowledged) {
      return {
        success: false,
        message: "Operation not acknowledged by database",
      };
    }

    if (updatedExam.matchedCount === 0) {
      return {
        success: false,
        message: "No matching teacher found to update",
      };
    }
    return {
      success: true,
      data: undefined,
      message: "Exam updated successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error updating exam: " + error.message,
    };
  }
}
