"use server";
import { mongodb } from "@/lib/mongodb";
import { IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { teacherCollectionName, ITeacher } from "@/models/teacher";
import { ServerActionResult } from "@/types";

export type FetchExamsResult = ServerActionResult<
  Pick<IExam, "id" | "name" | "description">[]
>;

export type FetchExamsData = {
  userEmail: string;
};

export const fetchExams = async (
  userEmail: string
): Promise<FetchExamsResult> => {
  try {
    if (!userEmail) {
      return {
        success: false,
        message: "Please provide userEmail",
      };
    }

    await mongodb.connect();
    const teacher = (await mongodb.collection(teacherCollectionName).findOne({
      email: userEmail,
    })) as ITeacher | null;

    if (!teacher) {
      return {
        success: true,
        data: [],
        message: "No teacher found with this email",
      };
    }

    // Check if teacher has exams
    if (!teacher.exam || teacher.exam.length === 0) {
      return {
        success: true,
        data: [],
        message: "No exams found for this teacher",
      };
    }

    const examData = teacher.exam.map((exam) => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
    }));

    return {
      success: true,
      data: examData,
      message: "Exams fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error fetching exams: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
