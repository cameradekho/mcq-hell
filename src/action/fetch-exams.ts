"use server";
import { mongodb } from "@/lib/mongodb";
import { examCollectionName, IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";

export type FetchExamsResult = ServerActionResult<
  Pick<IExam, "_id" | "name" | "description">[]
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
    const examData = await mongodb
      .collection<IExam>(examCollectionName)
      .find({
        createdByEmail: userEmail,
      })
      .toArray();

    if (!examData) {
      return {
        success: false,
        message: "No exams found",
      };
    }
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
