import { IExam, IQuestion } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { checkExamByUser } from "./check-exam-by-user";
import { mongodb } from "@/lib/mongodb";

export type IUpdateExamResult = ServerActionResult<undefined>;

export type UpdateExamData = {
  examName: string;
  userEmail: string;
  //   examDuration: number;
  //   examDescription: string;
  //   examQuestisions: IQuestion[];
  exam: Pick<IExam, "name" | "description" | "duration" | "questions">;
};

export async function updateExamByExamNameAndEmail(
  data: UpdateExamData
): Promise<IUpdateExamResult> {
  try {
    const examByTeacherExists = await checkExamByUser({
      userEmail: data.userEmail,
      examName: data.examName,
    });

    if (!examByTeacherExists.success) {
      return {
        success: false,
        message: examByTeacherExists.message,
      };
    }

    await mongodb.connect();
    const updatedExam = await mongodb.collection("teacher").updateOne(
      {
        email: data.userEmail,
        exam: {
          $elemMatch: {
            name: data.examName,
          },
        },
      },
      {
        $set: {
          exam: data.exam,
        },
      },
      {
        upsert: true,
      }
    );

    if (!updatedExam.acknowledged) {
      return {
        success: false,
        message: "Error updating exam",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam updated successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error updating exam",
    };
  }
}
