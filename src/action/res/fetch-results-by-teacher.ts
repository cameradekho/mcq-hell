"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "../fetch-teacher-by-id";
import { fetchTeacherByEmail } from "../fetch-teacher-by-email";
import {
  StudentAnswer,
  studentResponseCollectionName,
} from "@/models/students-response";
import { IExam, examCollectionName } from "@/models/exam";
import { teacherCollectionName } from "@/models/teacher";

export type IStudentScore = {
  studentEmail: string;
  studentName: string;
  score: number;
  totalMarks: number;
  grade: string;
  submittedAt: Date;
};

export type IExamResultSummary = {
  examId: string;
  examName: string;
  description: string;
  studentResults: IStudentScore[];
};

export type FetchResultsByTeacherResult = ServerActionResult<
  IExamResultSummary[]
>;

export type FetchResultsByTeacherData = {
  teacherId?: string;
  teacherEmail?: string;
};

export const fetchResultsByTeacher = async (
  data: FetchResultsByTeacherData
): Promise<FetchResultsByTeacherResult> => {
  try {
    if (!data.teacherId && !data.teacherEmail) {
      return {
        success: false,
        message: "Please provide either teacherId or teacherEmail",
      };
    }

    let teacherResult;

    if (data.teacherId) {
      teacherResult = await fetchTeacherById({ teacherId: data.teacherId });
    } else if (data.teacherEmail) {
      teacherResult = await fetchTeacherByEmail({ email: data.teacherEmail });
    }

    if (!teacherResult?.success || !teacherResult?.data) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    const teacher = teacherResult.data;
    const teacherEmail = teacher.email;
    const teacherId = teacher.id;

    await mongodb.connect();

    // Fetch the full teacher document with exams from the database
    const teacherWithExams = await mongodb
      .collection(teacherCollectionName)
      .findOne({ id: teacherId });

    if (
      !teacherWithExams ||
      !teacherWithExams.exam ||
      teacherWithExams.exam.length === 0
    ) {
      return {
        success: true,
        data: [],
        message: "No exams found for this teacher",
      };
    }

    // Get all student responses for exams created by this teacher
    const studentResponses = await mongodb
      .collection(studentResponseCollectionName)
      .find({
        "examAttempts.teacherEmail": teacherEmail,
      })
      .toArray();

    if (!studentResponses.length) {
      return {
        success: true,
        data: [],
        message: "No student responses found for any exams",
      };
    }

    // Group results by exam
    const examResults: IExamResultSummary[] = [];

    // Process each exam
    for (const exam of teacherWithExams.exam) {
      const examId = exam.id;

      // Find all responses for this exam
      const examResponses = studentResponses.flatMap((student) => {
        // Filter attempts for the current exam
        const relevantAttempts = student.examAttempts.filter(
          (attempt: any) =>
            attempt.examId === examId && attempt.teacherEmail === teacherEmail
        );

        // Map attempts to student scores
        return relevantAttempts.map((attempt: any) => ({
          studentEmail: student.studentEmail,
          studentName: student.studentName,
          score: attempt.score.scored,
          totalMarks: attempt.responses.length, // Assuming 1 mark per question
          submittedAt: attempt.score.submittedAt,
        }));
      });

      if (examResponses.length > 0) {
        examResults.push({
          examId: examId,
          examName: exam.name,
          description: exam.description,
          studentResults: examResponses,
        });
      }
    }

    return {
      success: true,
      data: examResults,
      message: "Results fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });

    return {
      success: false,
      message: `Error fetching results: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
