"use server";
import { ServerActionResult } from "@/types";
import { fetchTeacherById } from "../fetch-teacher-by-id";
import { fetchExamById } from "../fetch-exam-by-id";
import { mongodb } from "@/lib/mongodb";
import {
  IAnswerOption,
  IStudentResponseDocument,
  studentResponseCollectionName,
} from "@/models/students-response";
import { logger } from "@/models/logger";
import { fetchStudentById } from "../student/fetch-student-by-id";

export type AddStudentResponseResult = ServerActionResult<undefined>;

export type AddStudentResponseData = {
  examId: string;
  teacherId: string;
  studentId: string;
  responses: {
    questionId: string;
    question: string;
    image?: string;
    correctOption: IAnswerOption[];
    selectedOption: IAnswerOption[];
    isCorrect: boolean;
  }[];
  score: number;
};

export const addStudentResponse = async (
  data: AddStudentResponseData
): Promise<AddStudentResponseResult> => {
  try {
    // Individual field validation
    console.log("Adding kutta");
    if (!data.teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }

    if (!data.studentId) {
      return {
        success: false,
        message: "Please provide StudentID",
      };
    }

    if (!data.teacherId) {
      return {
        success: false,
        message: "Please provide teacherId",
      };
    }

    if (!data.examId) {
      return {
        success: false,
        message: "Please provide examId",
      };
    }

    if (!data.responses || data.responses.length === 0) {
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

    const studentExists = await fetchStudentById({
      studentId: data.studentId,
    });
    if (!studentExists) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    await mongodb.connect();

    // Make sure all response items have image field (even if empty string)
    const normalizedResponses = data.responses.map((item) => ({
      ...item,
      image: item.image || "",
    }));

    console.log(
      "CorrectOption Responses:",
      normalizedResponses.map((item) =>
        item.correctOption.map((item1) => item1.content)
      )
    );
    console.log(
      "SelectedOption Responses:",
      normalizedResponses.map((item) =>
        item.selectedOption.map((item1) => item1.content)
      )
    );

    console.log(
      "normalizedResponses:",
      normalizedResponses.map((item) => item)
    );

    const result = await mongodb
      .collection<IStudentResponseDocument>(studentResponseCollectionName)
      .insertOne({
        examId: data.examId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        responses: normalizedResponses,
        scored: data.score,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
