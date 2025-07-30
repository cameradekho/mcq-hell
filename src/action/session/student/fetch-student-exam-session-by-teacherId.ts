"use server";

import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { mongodb } from "@/lib/mongodb";
import { IStudentExamSession } from "@/models/student-exam-session";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type IFetchStudentExamSessionBy_techrIdResult = ServerActionResult<
  IStudentExamSession[]
>;

export type IFetchStudentExamSessionBy_techrIdData = {
  teacherId: string;
  examId: string;
};

export type IStudentExamSessionWithDetails = IStudentExamSession & {
  studentDetail: {
    studentName: string;
    studentEmail: string;
    studentAvatar: string;
  };
};

export const fetchStudentExamSessionByTeachId = async (
  data: IFetchStudentExamSessionBy_techrIdData
): Promise<IFetchStudentExamSessionBy_techrIdResult> => {
  try {
    console.log("ONEEE");
    console.log("TeacherId", data.teacherId);
    console.log("ExamId", data.examId);

    if (!data.teacherId || !data.examId) {
      return {
        success: false,
        message: "Please provide teacherId and examId",
      };
    }

    const teacherExists = await fetchTeacherById({
      teacherId: data.teacherId,
    });

    console.log("TWOOOO");
    if (!teacherExists.success) {
      return {
        success: false,
        message: teacherExists.message,
      };
    }

    if (teacherExists.data._id?.toString() !== data.teacherId) {
      return {
        success: false,
        message: "You cannot access this page...",
      };
    }

    console.log("THREEE");

    const examExists = await fetchExamById({
      teacherId: data.teacherId,
      examId: data.examId,
    });

    if (!examExists.success) {
      console.log("HUBBA TWO");
      return {
        success: false,
        message: examExists.message,
      };
    }

    await mongodb.connect();

    console.log("FOURRRR");

    const studentSessionWithDetails = (await mongodb
      .collection<IStudentExamSession>("studentExamSession")
      .aggregate([
        {
          $match: {
            examId: new ObjectId(data.examId),
            teacherId: new ObjectId(data.teacherId),
          },
        },
        {
          $lookup: {
            from: "student",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "student.role": "student", // Ensure we only get students
          },
        },
        {
          $addFields: {
            studentDetail: {
              studentName: "$student.name",
              studentEmail: "$student.email",
              studentAvatar: "$student.avatar",
            },
          },
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            examId: 1,
            teacherId: 1,
            examSessionId: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            studentDetail: 1,
          },
        },
        {
          $sort: {
            "studentDetail.studentName": 1,
            createdAt: -1,
          },
        },
      ])
      .toArray()) as IStudentExamSessionWithDetails[];

    console.log("FIVEEE");

    if (!studentSessionWithDetails || studentSessionWithDetails.length === 0) {
      return {
        success: false,
        message: "No student exam sessions found for this exam",
      };
    }

    return {
      success: true,
      data: studentSessionWithDetails,
      message: `Found ${studentSessionWithDetails.length} student exam sessions`,
    };
  } catch (error) {
    console.error("Error in fetchStudentExamSessionByTeachId:", error);
    return {
      success: false,
      message: "Error fetching student exam session....",
    };
  }
};
