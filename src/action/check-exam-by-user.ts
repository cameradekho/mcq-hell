"use server";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { mongodb } from "@/lib/mongodb";
import { IExam } from "@/models/exam";

export type CheckExamByUserResult = ServerActionResult<undefined>;

type CheckExamByUserData = {
  userEmail: string;
  examName: string;
};

export const checkExamByUser = async (
  data: CheckExamByUserData
): Promise<CheckExamByUserResult> => {
  try {
    if (!data.userEmail || !data.examName) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }

    const userData = await auth();

    if (!userData?.user?.email) {
      return {
        success: false,
        message: "You must be logged in to check an exam",
      };
    }

    if (userData.user.email !== data.userEmail) {
      return {
        success: false,
        message: "You are not authorized to check this exam",
      };
    }

    await mongodb.connect();
    const teacherData = await mongodb
      .collection("teacher")
      .findOne({ email: data.userEmail });

    if (!teacherData) {
      return {
        success: false,
        message: "User does not exist",
      };
    }

    const examData = teacherData.exam.find(
      (exam: IExam) => exam.name === data.examName
    );

    if (!examData) {
      return {
        success: false,
        message: "Exam does not exist",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam checked successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error checking exam by user: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
