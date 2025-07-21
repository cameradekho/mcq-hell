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

export type FetchResultByTeacherIdExamIdResult = ServerActionResult<
  IStudentResponseDocument[] | undefined
>;

export type FetchResultByTeacherIdExamIdData = {
  teacherId: string;
  examId: string;
};

export const fetchResultByTeacherIdExamId = async (
  data: FetchResultByTeacherIdExamIdData
): Promise<ServerActionResult<any[]>> => {
  try {
    if (!data.teacherId || !data.examId) {
      return {
        success: false,
        message: "Please provide teacherId and examId",
      };
    }

    const teacherExists = await fetchTeacherById({ teacherId: data.teacherId });
    if (!teacherExists.success || !teacherExists.data?.email) {
      return {
        success: false,
        message: "Teacher not found or missing email",
      };
    }

    const examExists = await fetchExamById({
      teacherId: data.teacherId,
      examId: data.examId,
    });
    if (!examExists.success) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    await mongodb.connect();

    const result = await mongodb
      .collection(studentResponseCollectionName)
      .aggregate([
        {
          $match: {
            examId: data.examId,
            teacherId: data.teacherId,
          },
        },
        {
          $lookup: {
            from: "student",
            let: { studentId: "$studentId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      // Try direct match first (if both are ObjectId or both are string)
                      { $eq: ["$_id", "$$studentId"] },
                      // Try string comparison (convert ObjectId to string)
                      { $eq: [{ $toString: "$_id" }, "$$studentId"] },
                      // Try ObjectId comparison (convert string to ObjectId)
                      {
                        $eq: [
                          "$_id",
                          {
                            $cond: {
                              if: { $eq: [{ $type: "$$studentId" }, "string"] },
                              then: { $toObjectId: "$$studentId" },
                              else: "$$studentId",
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "studentInfo",
          },
        },
        {
          $unwind: {
            path: "$studentInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            examId: 1,
            responses: 1,
            scored: 1,
            createdAt: 1,
            "studentInfo.name": 1,
            "studentInfo.email": 1,
            "studentInfo.avatar": 1,
          },
        },
      ])
      .toArray();

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "No result found",
      };
    }

    return {
      success: true,
      data: result,
      message: "Result with student info fetched successfully",
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
