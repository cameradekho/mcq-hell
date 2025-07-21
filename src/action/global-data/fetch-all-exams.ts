import { mongodb } from "@/lib/mongodb";
import { IExam, IQuestion } from "@/models/exam";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";

export type FetchAllExamsResult = ServerActionResult<IExam[]>;

export const fetchAllExams = async (): Promise<FetchAllExamsResult> => {
  try {
    await mongodb.connect();

    const exams = await mongodb.collection("exam").find().toArray();

    if (!exams) {
      return {
        success: false,
        message: "Error fetching exams",
      };
    }

    const formattedExams: IExam[] = exams.map((exam) => ({
      _id: exam._id,
      name: exam.name,
      description: exam.description,
      duration: exam.duration,
      questions: exam.questions.map((question: IQuestion) => ({
        id: question._id,
        question: question.question,
        image: question.image,
        options: question.options.map((option) => ({
          id: option._id,
          textAnswer: option.textAnswer,
          image: option.image,
          isCorrect: option.isCorrect,
        })),
        answer: question.answer,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      })),
      createdByEmail: exam.createdByEmail,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    }));

    return {
      success: true,
      data: formattedExams,
      message: "Exams fetched successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
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
