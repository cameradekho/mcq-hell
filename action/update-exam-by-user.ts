import { mongodb } from "@/lib/mongodb";
import { IExam, IQuestion } from "@/models/exam";
import { logger } from "@/models/logger";
import { teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";

export type UpdateExamByUserResult = ServerActionResult<undefined>;

type UpdateExamByUserData = {
  userEmail: string;
  examName: string;
  examDescription: string;
  duration: number;
  questions: IQuestion[];
};

export const updateExamByUser = async (
  data: UpdateExamByUserData
): Promise<UpdateExamByUserResult> => {
  try {
    if (
      !data.userEmail ||
      !data.examName ||
      !data.examDescription ||
      !data.duration ||
      !data.questions
    ) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }

    await mongodb.connect();
    const userData = await mongodb
      .collection("teacher")
      .findOne({ email: data.userEmail });

    if (!userData) {
      return {
        success: false,
        message: "User does not exist",
      };
    }

    const examData = userData.exam.find(
      (exam: IExam) => exam.name === data.examName
    );
    if (!examData) {
      return {
        success: false,
        message: "Exam does not exist",
      };
    }

    const res = await mongodb.collection(teacherCollectionName).updateOne(
      { email: data.userEmail },
      {
        $set: {
          exam: {
            name: data.examName,
            description: data.examDescription,
            duration: data.duration,
            questions: data.questions,
            updatedAt: Date.now(),
          },
        } as any,
      }
    );

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error updating exam by user",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam updated successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error updating exam by user: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
