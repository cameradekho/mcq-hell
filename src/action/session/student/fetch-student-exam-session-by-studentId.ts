"use server";

// fetching student student-session for student's purpose
import { fetchStudentById } from "@/action/student/fetch-student-by-id";
import { mongodb } from "@/lib/mongodb";
import { IStudentExamSession } from "@/models/student-exam-session";
import { IExamSession } from "@/models/teacher-exam-session";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type IStudentExamSessionWithDetails = IStudentExamSession & {
  examSessionDetails?: IExamSession[];
};

export type IFetchStudentExamSessionBy_StudentIdResult =
  ServerActionResult<IStudentExamSessionWithDetails>;

export type IFetchStudentExamSessionBy_StudentIdData = {
  studentId: string;
  examId: string;
  teacherId: string;
  examSessionId: string;
};

export const fetchStudentExamSessionByStudentId = async (
  data: IFetchStudentExamSessionBy_StudentIdData
): Promise<IFetchStudentExamSessionBy_StudentIdResult> => {
  try {
    if (!data.studentId || !data.examId) {
      return {
        success: false,
        message: "Please provide studentId and examId",
      };
    }

    const studentExists = await fetchStudentById({
      studentId: data.studentId,
    });

    if (!studentExists.success) {
      return {
        success: false,
        message: studentExists.message,
      };
    }

    await mongodb.connect();

    const studentSessionResult = await mongodb
      .collection<IStudentExamSession>("studentExamSession")
      .aggregate([
        {
          $match: {
            studentId: new ObjectId(data.studentId),
            teacherId: new ObjectId(data.teacherId),
            examId: new ObjectId(data.examId),
            examSessionId: new ObjectId(data.examSessionId),
          },
        },
        {
          $lookup: {
            from: "examSession",
            localField: "examSessionId",
            foreignField: "_id",
            as: "examSessionDetails",
          },
        },
      ])
      .toArray();

    if (!studentSessionResult || studentSessionResult.length === 0) {
      return {
        success: false,
        message: "Student exam session not found...",
      };
    }

    return {
      success: true,
      data: studentSessionResult[0] as IStudentExamSession & {
        examSessionDetails?: IExamSession[];
      },
      message: "Student exam session found",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error fetching student exam session",
    };
  }
};
