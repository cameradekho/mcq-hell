"use server";

import { fetchStudentById } from "@/action/student/fetch-student-by-id";
import { ServerActionResult } from "@/types";
import { fetchStudentExamSessionByStudentId } from "./fetch-student-exam-session-by-studentId";
import { mongodb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  IStudentExamSession,
  studentExamSessionCollectionName,
} from "@/models/student-exam-session";

export type UpdateStudentExamSession_ByStudentResult =
  ServerActionResult<undefined>;

export type UpdateStudentExamSession_ByStudentData = {
  studentId: string;
  examId: string;
  examSessionId: string;
  teacherId: string;
  status: "not-started" | "started" | "completed" | "block";
};

export const updateStudentExamSessionbyStudent = async (
  data: UpdateStudentExamSession_ByStudentData
): Promise<UpdateStudentExamSession_ByStudentResult> => {
  try {
    const { studentId, examId, teacherId, examSessionId, status } = data;

    // 1. Validate input
    if (!studentId || !examId || !teacherId || !examSessionId) {
      return {
        success: false,
        message: "Please provide studentId, examId, teacherId, and sessionId",
      };
    }

    // 3. Check if student exists
    const studentExists = await fetchStudentById({ studentId });
    if (!studentExists.success) {
      return {
        success: false,
        message: studentExists.message,
      };
    }

    // 4. Fetch existing session
    const studentSessionExists = await fetchStudentExamSessionByStudentId({
      studentId,
      examId,
      teacherId,
      examSessionId,
    });

    if (!studentSessionExists.success || !studentSessionExists.data) {
      return {
        success: false,
        message: studentSessionExists.message || "Student session not found",
      };
    }

    const existingStatus = studentSessionExists.data.status;

    // 5. Skip update if status is the same
    if (existingStatus === status) {
      return {
        success: true,
        message: `No changes needed. Status is already '${status}'.`,
        data: undefined,
      };
    } else if (existingStatus === "completed") {
      return {
        success: true,
        message: `Student exam is already completed.`,
        data: undefined,
      };
    }

    // 6. Establish database connection
    await mongodb.connect();

    const updateCriteria = {
      studentId: new ObjectId(studentId),
      examId: new ObjectId(examId),
      teacherId: new ObjectId(teacherId),
      examSessionId: new ObjectId(examSessionId),
    };

    const updateData = {
      $set: {
        status: status as IStudentExamSession["status"],
        updatedAt: new Date(),
      },
    };

    // Debug logging
    console.log("Update criteria:", updateCriteria);
    console.log("Update data:", updateData);

    // 8. Perform the update
    const res = await mongodb
      .collection<IStudentExamSession>(studentExamSessionCollectionName)
      .updateOne(updateCriteria, updateData);

    // Debug logging
    console.log("Update result:", {
      acknowledged: res.acknowledged,
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
    });

    // 9. Validate update result
    if (!res.acknowledged) {
      return {
        success: false,
        message: "Database operation was not acknowledged",
      };
    }

    if (res.matchedCount === 0) {
      return {
        success: false,
        message:
          "No document found matching the provided criteria. Please verify the IDs are correct.",
      };
    }

    if (res.modifiedCount === 0) {
      return {
        success: false,
        message:
          "Document found but no changes were made. This might indicate the status was already set to the target value.",
      };
    }

    return {
      success: true,
      message: `Status updated from '${existingStatus}' to '${status}' successfully.`,
      data: undefined,
    };
  } catch (error) {
    console.error("Update Error:", error);
    return {
      success: false,
      message: `Unexpected error while updating student exam session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
