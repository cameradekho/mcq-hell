"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { nanoid } from "nanoid";

export type AddExamByUserResult = ServerActionResult<undefined>;

type AddExamByUserData = {
  userEmail: string;
  examName: string;
  examDescription: string;
  duration: number;
  questions: Array<{
    question: string;
    image?: string;
    options: Array<{
      text?: string;
      image?: string;
      isCorrect?: boolean;
    }>;
  }>;
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
      data.questions.length === 0
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

    console.log(
      data.questions.map((q) => q.options.map((opt) => opt.text || "empty"))
    );

    const resofUpdate = await mongodb.collection("teacher").updateOne(
      { email: data.userEmail },
      {
        $push: {
          exam: {
            id: nanoid(),
            name: data.examName,
            description: data.examDescription,
            duration: data.duration,
            questions: data.questions.map((q) => {
              // Create options with IDs first
              const optionsWithIds = q.options.map((opt) => ({
                id: nanoid(), //option Id
                textAnswer: opt.text,
                image: opt.image || "",
                isCorrect: opt.isCorrect || false,
              }));

              // Now use those IDs for the answer array
              return {
                id: nanoid(), //exam Id
                question: q.question,
                image: q.image || "",
                options: optionsWithIds,
                answer: optionsWithIds
                  .filter((opt) => opt.isCorrect)
                  .map((opt) => opt.id),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }),
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
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error adding exam by user: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
