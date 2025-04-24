"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "../fetch-teacher-by-id";
import { fetchExamById } from "../fetch-exam-by-id";
import {
  IStudentResponseDocument,
  StudentAnswer,
  studentResponseCollectionName,
} from "@/models/students-response";

export type IScores = {
  scored: number;
  responses: StudentAnswer[];
  submittedAt: Date;
};

export type ExamResultWithStudentInfo = {
  studentEmail: string;
  studentName: string;
  scores: IScores[];
};

export type FetchResultByTeacherIdExamIdResult = ServerActionResult<
  ExamResultWithStudentInfo[]
>;

export type FetchResultByTeacherIdExamIdData = {
  teacherId: string;
  examId: string;
};

export const fetchResultByTeacherIdExamId = async (
  data: FetchResultByTeacherIdExamIdData
): Promise<FetchResultByTeacherIdExamIdResult> => {
  try {
    if (!data.teacherId || !data.examId) {
      return {
        success: false,
        message: "Please provide teacherId and examId",
      };
    }

    const teacherResult = await fetchTeacherById({ teacherId: data.teacherId });
    if (!teacherResult.success || !teacherResult.data) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    const teacherEmail = teacherResult.data.email;

    const examExists = await fetchExamById({
      teacherId: data.teacherId,
      examId: data.examId,
    });

    if (!examExists) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    await mongodb.connect();

    const studentResponses = await mongodb
      .collection(studentResponseCollectionName)
      .find({
        "examAttempts.examId": data.examId,
        "examAttempts.teacherEmail": teacherEmail,
      })
      .toArray();

    if (!studentResponses.length) {
      return {
        success: false,
        message: "No student responses found for this exam",
      };
    }

    const allResults = studentResponses.flatMap((student) =>
      student.examAttempts
        .filter(
          (attempt: any) =>
            attempt.examId === data.examId &&
            attempt.teacherEmail === teacherEmail
        )
        .map((attempt: any) => ({
          studentEmail: student.studentEmail,
          studentName: student.studentName,
          score: {
            scored: attempt.score.scored,
            submittedAt: attempt.score.submittedAt,
            responses: attempt.responses,
          },
        }))
    );

    return {
      success: true,
      data: allResults,
      message: "Results fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });

    return {
      success: false,
      message: "Error fetching result",
    };
  }
};
