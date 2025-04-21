"use server";
import { mongodb } from "@/lib/mongodb";
import { IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { checkExamByUser } from "./check-exam-by-user";
import { teacherCollectionName } from "@/models/teacher";

export type IFetchExamResult = ServerActionResult<IExam>;

export type FetchExamData = {
  examName: string;
  userEmail: string;
};

export async function fetchExamByExamNameAndEmail(
  data: FetchExamData
): Promise<IFetchExamResult> {
  try {
    const examByTeacherExists = await checkExamByUser({
      userEmail: data.userEmail,
      examName: data.examName,
    });

    if (!examByTeacherExists.success) {
      return {
        success: false,
        message: examByTeacherExists.message,
      };
    }

    await mongodb.connect();
    const exam = await mongodb.collection(teacherCollectionName).findOne({
      email: data.userEmail,
    });

    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    const examData = exam.exam.find(
      (exam: IExam) => exam.name === data.examName
    );

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
}
