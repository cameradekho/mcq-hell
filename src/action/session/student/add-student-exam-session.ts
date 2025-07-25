"use server";

import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchExamSessionByExamId } from "@/action/fetch-session-by-examId";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { fetchStudentById } from "@/action/student/fetch-student-by-id";
import { mongodb } from "@/lib/mongodb";
import {
  IStudentExamSession,
  studentExamSessionCollectionName,
} from "@/models/student-exam-session";
import { ServerActionResult } from "@/types";
import { ObjectId } from "mongodb";


export type AddStudentExamSessionResult =
  ServerActionResult<IStudentExamSession>;

export type AddStudentExamSessionData = {
  studentId: string;
  examId: string;
  teacherId: string;
  examSessionId: string;
  status: "not-started" | "started" | "completed" | "block";
};

export const addStudentExamSession = async (
  data: AddStudentExamSessionData
): Promise<AddStudentExamSessionResult> => {
  try {
    if (
      !data.studentId ||
      !data.examId ||
      !data.teacherId ||
      !data.examSessionId
    ) {
      return {
        success: false,
        message:
          "Please provide studentId, examId, teacherId, and examSessionId",
      };
    }

    const studentExists = await fetchStudentById({
      studentId: data.studentId,
    });

    if (!studentExists.success) {
      return {
        success: false,
        message: studentExists.message,
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

    const newStudentExamSession: IStudentExamSession = {
      studentId: new ObjectId(data.studentId),
      examId: new ObjectId(data.examId),
      teacherId: new ObjectId(data.teacherId),
      examSessionId: new ObjectId(data.examSessionId),
      status: "not-started",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await mongodb
      .collection<IStudentExamSession>(studentExamSessionCollectionName)
      .insertOne(newStudentExamSession);

    if (!insertResult.acknowledged) {
      return {
        success: false,
        message: "Error adding student exam session",
      };
    }

    if (insertResult.insertedId === null) {
      return {
        success: false,
        message: "Error adding student exam session",
      };
    }

    // Add the generated _id to the document
    const createdStudentExamSession: IStudentExamSession = {
      ...newStudentExamSession,
      _id: insertResult.insertedId,
    };

    return {
      success: true,
      data: createdStudentExamSession,
      message: "Student exam session added successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error adding student exam session",
    };
  }
};