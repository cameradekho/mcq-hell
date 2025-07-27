"use server";
import { mongodb } from "@/lib/mongodb";
import { examCollectionName, IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type FetchExamsResult = ServerActionResult<
  Pick<IExam, "_id" | "name" | "description">[]
>;

export type FetchExamsData = {
  teacherId: string;
};

export const fetchExams = async (data: FetchExamsData): Promise<FetchExamsResult> => {
  try {
    if (!data.teacherId) {
      return {
        success: false,
        message: "Please provide userEmail",
      };
    }

    await mongodb.connect();
    const examData = await mongodb
      .collection<IExam>(examCollectionName)
      .find({ teacherId: new ObjectId(data.teacherId) })
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
