"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { teacherCollectionName } from "@/models/teacher";
import { ObjectId } from "mongodb";

export type DeleteExamByIdResult = ServerActionResult<undefined>;

type DeleteExamByIdData = {
  examId: string;
};

export const deleteExamById = async (
  props: DeleteExamByIdData
): Promise<DeleteExamByIdResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to delete an exam",
      };
    }
    console.log(props.examId);
    if (!props.examId) {
      return {
        success: false,
        message: "Please provide examId",
      };
    }

    await mongodb.connect();
    const res = await mongodb
      .collection(teacherCollectionName)
      .findOne({ email: session.user.email });

    if (!res) {
      return {
        success: false,
        message: "User does not exist",
      };
    }

    const examObjectId = new ObjectId(props.examId);
    const result = await mongodb.collection("exam").updateOne(
      { _id: examObjectId },
      {
        $unset: {
          session: "",
        },
      }
    );

    if (!result.acknowledged) {
      return {
        success: false,
        message: "Error deleting exam by id...",
      };
    }

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: "No exam was deleted. Please check the exam ID.",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam deleted successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error deleting exam by id: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
