"use server";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "../fetch-teacher-by-id";
import { fetchExamById } from "../fetch-exam-by-id";
import { mongodb } from "@/lib/mongodb";
import { studentResponseCollectionName } from "@/models/students-response";
import { logger } from "@/models/logger";
import { IAnswer } from "@/models/exam";

export type AddStudentResponseResult = ServerActionResult<undefined>;

export type AddStudentResponseData = {
  teacherId: string;
  teacherEmail: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  examId: string;
  response: {
    questionId: string;
    question: string;
    image?: string;
    correctOptionId: IAnswer["id"][];
    selectedOptionId: IAnswer["id"][];
    isCorrect: boolean;
  }[];
  score: {
    scored: number;
    submittedAt: Date;
  };
};

export const addStudentResponse = async (
  data: AddStudentResponseData
): Promise<AddStudentResponseResult> => {
  try {
    // Individual field validation
    if (!data.teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }

    if (!data.teacherEmail) {
      return {
        success: false,
        message: "Please provide teacherEmail",
      };
    }

    if (!data.studentName) {
      return {
        success: false,
        message: "Please provide studentName",
      };
    }

    if (!data.studentEmail) {
      return {
        success: false,
        message: "Please provide studentEmail",
      };
    }

    if (!data.examId) {
      return {
        success: false,
        message: "Please provide examId",
      };
    }

    if (!data.response || data.response.length === 0) {
      return {
        success: false,
        message: "Please provide response data",
      };
    }

    if (!data.score) {
      return {
        success: false,
        message: "Please provide score",
      };
    }

    const teacherExists = await fetchTeacherById({ teacherId: data.teacherId });
    if (!teacherExists) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

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
    const now = new Date();

    // Make sure all response items have image field (even if empty string)
    const normalizedResponses = data.response.map((item) => ({
      ...item,
      image: item.image || "",
    }));

    const result = await mongodb
      .collection(studentResponseCollectionName)
      .updateOne(
        { studentEmail: data.studentEmail },
        {
          $setOnInsert: {
            studentName: data.studentName,
            studentAvatar: data.studentAvatar || "",
            createdAt: now,
          },
          $set: {
            updatedAt: now,
          },
          $push: {
            examAttempts: {
              examId: data.examId,
              teacherEmail: data.teacherEmail,
              responses: normalizedResponses,
              score: data.score,
            },
          } as any,
        },
        { upsert: true }
      );

    if (!result.acknowledged) {
      return {
        success: false,
        message: "Error adding student response",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Student response added successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error adding student response",
    };
  }
};
