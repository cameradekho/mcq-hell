"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { nanoid } from "nanoid";

export type AddExamResult = ServerActionResult<undefined>;

type AddExamData = {
  name: string;
  description: string;
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
  createdName: string;
  createdByEmail: string;
};

export const addExam = async (data: AddExamData): Promise<AddExamResult> => {
  try {
    if (
      !data.name ||
      !data.description ||
      !data.duration ||
      data.questions.length === 0
    ) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }

    await mongodb.connect();

    const res = await mongodb.collection("exam").insertOne({
      id: nanoid(),
      name: data.name,
      description: data.description,
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
      createdByEmail: data.createdByEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error adding exam",
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
      message: `Error adding exam: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
