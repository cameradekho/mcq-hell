"use server";
import { mongodb } from "@/lib/mongodb";
import { IQuestion } from "@/models/exam";
import { ServerActionResult } from "@/types";
import { nanoid } from "nanoid";

export type AddExamByUserResult = ServerActionResult<undefined>;

type AddExamByUserData = {
  userEmail: string;
  examName: string;
  examDescription: string;
  duration: number;
  questions: IQuestion[];
};

export const addExamByUser = async (
  data: AddExamByUserData
): Promise<AddExamByUserResult> => {
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

    const examData = await mongodb
      .collection("exam")
      .findOne({ name: data.examName });

    if (examData) {
      return {
        success: false,
        message: "Exam already exists",
      };
    }

    const resofUpdate = await mongodb.collection("teacher").updateOne(
      { email: data.userEmail },
      {
        $push: {
          exam: {
            id: nanoid(),
            name: data.examName,
            description: data.examDescription,
            duration: data.duration,
            questions: data.questions.map((q) => ({
              id: nanoid(),
              question: q.question,
              options: q.options,
              answer: q.answer,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        } as any,
      }
    );

    console.log("result is : ", resofUpdate.acknowledged);

    if (!resofUpdate.acknowledged) {
      return {
        success: false,
        message: "Error adding exam by user",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Exam added successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error adding exam by user: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
