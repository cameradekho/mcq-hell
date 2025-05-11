"use server";
import { mongodb } from "@/lib/mongodb";
import { IExam, IQuestion } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";

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

    await mongodb.connect();
    const teacherData = await mongodb.collection("teacher").findOne({
      id: data.teacherId,
    });

    if (!teacherData) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    console.log(teacherData);

    const exam = teacherData.exam.find(
      (exam: IExam) => exam.id === data.examId
    );

    console.log(exam);

    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    console.log(exam.questions.map((item: IQuestion) => item.id));

    return {
      success: true,
      data: exam,
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
