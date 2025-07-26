"use server";
import { IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { mongodb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { fetchTeacherById } from "./fetch-teacher-by-id";

export type IUpdateExamResult = ServerActionResult<undefined>;

export type UpdateExamData = {
  examId: ObjectId;
  teacherId: string;
  exam: Pick<IExam, "name" | "description" | "duration" | "questions">;
};

export async function updateExamByExamIdAndTeacherId(
  data: UpdateExamData
): Promise<IUpdateExamResult> {
  try {
    if (!data.examId || !data.teacherId || !data.exam) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }

    const teacherData = await fetchTeacherById({ teacherId: data.teacherId });

    console.log("Hubba teacherData: ", teacherData);

    if (!teacherData.success) {
      return {
        success: false,
        message: "Teacher not found....",
      };
    }

    console.log("Hubba teacherData.data: ", teacherData.data.email);

    await mongodb.connect();

    const processedExamData = ensureObjectIds(data.exam);

    const updatedExamData = await mongodb
      .collection<IExam>("exam")
      .findOneAndUpdate(
        {
          _id: new ObjectId(data.examId),
          createdByEmail: teacherData.data.email,
        },
        {
          $set: {
            ...processedExamData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

    if (!updatedExamData) {
      return {
        success: false,
        message: "Exam not found....",
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
      message: "Error updating exam: " + error.message,
    };
  }
}

function ensureObjectIds(exam: Partial<IExam>): Partial<IExam> {
  const processedExam = { ...exam };

  // Process questions array
  if (processedExam.questions) {
    processedExam.questions = processedExam.questions.map((question) => {
      const processedQuestion = { ...question };

      // Ensure question has _id
      if (!processedQuestion._id) {
        processedQuestion._id = new ObjectId();
      }

      // Process options (IAnswer[])
      if (processedQuestion.options) {
        processedQuestion.options = processedQuestion.options.map((option) => {
          const processedOption = { ...option };

          // Ensure option has _id
          if (!processedOption._id) {
            processedOption._id = new ObjectId();
          }

          return processedOption;
        });
      }

      // Update question timestamps
      if (!processedQuestion.createdAt) {
        processedQuestion.createdAt = new Date();
      }
      processedQuestion.updatedAt = new Date();

      return processedQuestion;
    });
  }

  return processedExam;
}
