import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { mongodb } from "@/lib/mongodb";
import { IStudentExamSession } from "@/models/student-exam-session";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";

export type IFetchStudentExamSessionBy_techrIdResult = ServerActionResult<
  IStudentExamSession[]
>;

export type IFetchStudentExamSessionBy_techrIdData = {
  teacherId: string;
  examId: string;
};

export const fetchStudentExamSessionByTeachId = async (
  data: IFetchStudentExamSessionBy_techrIdData
): Promise<IFetchStudentExamSessionBy_techrIdResult> => {
  try {
    if (!data.teacherId || !data.examId) {
      return {
        success: false,
        message: "Please provide teacherId and examId",
      };
    }

    const teacherExists = await fetchTeacherById({
      teacherId: data.teacherId,
    });

    if (!teacherExists.success) {
      return {
        success: false,
        message: teacherExists.message,
      };
    }

    const examExists = await fetchExamById({
      teacherId: data.teacherId,
      examId: data.examId,
    });

    if (!examExists.success) {
      return {
        success: false,
        message: examExists.message,
      };
    }

    await mongodb.connect();

    const studentSession = await mongodb
      .collection<IStudentExamSession>("studentExamSession")
      .find({
        examId: new ObjectId(data.examId),
        teacherId: new ObjectId(data.teacherId),
      })
      .toArray();

    if (!studentSession) {
      return {
        success: false,
        message: "Student exam session not found",
      };
    }
    return {
      success: true,
      data: studentSession,
      message: "Student exam session found",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error fetching student exam session",
    };
  }
};
