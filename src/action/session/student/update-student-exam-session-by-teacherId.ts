"use server";
import { ServerActionResult } from "@/types";
import { fetchStudentExamSessionByTeachId } from "./fetch-student-exam-session-by-teacherId";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { mongodb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IStudentExamSession } from "@/models/student-exam-session";

export type UpdateStudentExamSession_ByTeacherIdResult =
  ServerActionResult<undefined>;

export type UpdateStudentExamSession_ByTeacherIdData = {
  teacherId: string;
  examId: string;
  studentId: string;
  status: "not-started" | "started" | "completed" | "block";
};

export const updateStudentExamSessionByTeacher = async (
  data: UpdateStudentExamSession_ByTeacherIdData
): Promise<UpdateStudentExamSession_ByTeacherIdResult> => {
  try {

    console.log("updateStudentExamSessionByTeacher : ", data);
    if (!data.teacherId || !data.examId || !data.studentId) {
      return {
        success: false,
        message: "Please provide teacherId, examId, teacherId, and sessionId",
      };
    }

    const studentSessionExists = await fetchStudentExamSessionByTeachId({
      teacherId: data.teacherId,
      examId: data.examId,
    });

    if (!studentSessionExists.success) {
      return {
        success: false,
        message: studentSessionExists.message,
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

    const studentExists = await fetchStudentExamSessionByTeachId({
      teacherId: data.teacherId,
      examId: data.examId,
    });

    if (!studentExists.success) {
      return {
        success: false,
        message: studentExists.message,
      };
    }

    await mongodb.connect();

    const res = await mongodb
      .collection<IStudentExamSession>("studentExamSession")
      .updateOne(
        {
          examId: new ObjectId(data.examId),
          teacherId: new ObjectId(data.teacherId),
          studentId: new ObjectId(data.studentId),
        },
        {
          $set: {
            status: data.status,
            updatedAt: new Date(),
          },
        }
      );


    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error updating student exam session",
      };
    }

    if (res.modifiedCount === 0) {
      return {
        success: false,
        message: "No changes made to the student exam session",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Student exam session updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error updating student exam session",
    };
  }
};
