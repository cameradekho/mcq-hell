"use server";
import { mongodb } from "@/lib/mongodb";
import { examCollectionName, IExam } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import { fetchTeacherById } from "../fetch-teacher-by-id";

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
  teacherId: string;
};

export const addExam = async (data: AddExamData): Promise<AddExamResult> => {
  try {
    if (
      !data.name ||
      !data.description ||
      !data.duration ||
      data.questions.length === 0||
      !data.teacherId
    ) {
      return {
        success: false,
        message: "Please provide all the required fields",
      };
    }

    await mongodb.connect();

    console.log("Hubba teacherId: ", data.teacherId);

    const teacherExists = await fetchTeacherById({
      teacherId: data.teacherId,
    });

    if (!teacherExists.success) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    const res = await mongodb.collection<IExam>(examCollectionName).insertOne({
      _id: new ObjectId(),
      name: data.name,
      description: data.description,
      duration: data.duration,
      questions: data.questions.map((q) => {
        // Create options with IDs first
        const optionsWithIds = q.options.map((opt) => ({
          _id: new ObjectId(), //option Id
          textAnswer: opt.text,
          image: opt.image || "",
          isCorrect: opt.isCorrect || false,
        }));

        // Now use those IDs for the answer array
        return {
          _id: new ObjectId(),
          question: q.question,
          image: q.image || "",
          options: optionsWithIds,
          answer: optionsWithIds
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt._id),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
      teacherId: new ObjectId(data.teacherId),
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
