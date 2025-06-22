"use server";
import { mongodb } from "@/lib/mongodb";
import { examCollectionName } from "@/models/exam";
import { logger } from "@/models/logger";
import { teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { fetchExamById } from "./fetch-exam-by-id";

export type AddSessionInExamResult = ServerActionResult<undefined>;

export type AddSessionInExamData = {
  teacherId: string;
  examId: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
};

export const addSessionInExam = async (
  data: AddSessionInExamData
): Promise<AddSessionInExamResult> => {
  try {
    if (
      !data.examId ||
      !data.sessionDate ||
      !data.startTime ||
      !data.endTime ||
      !data.teacherId
    ) {
      return {
        success: false,
        message: "Please provide examId, sessionDate, startTime and endTime",
      };
    }

    await mongodb.connect();
    const teacherObjectId = new ObjectId(data.teacherId);

    // Convert sessionDate to dayjs object for date manipulation
    const sessionDay = dayjs(data.sessionDate);

    // Parse time strings and combine with session date
    // Try multiple formats to handle different time formats
    let formattedStartTime: string;
    let formattedEndTime: string;

    try {
      // Try 12-hour format first (e.g., "2:30 PM", "10:15 AM")
      const startDateTime =
        sessionDay.format("YYYY-MM-DD") + " " + data.startTime;
      const endDateTime = sessionDay.format("YYYY-MM-DD") + " " + data.endTime;

      formattedStartTime = dayjs(
        startDateTime,
        "YYYY-MM-DD h:mm A"
      ).toISOString();
      formattedEndTime = dayjs(endDateTime, "YYYY-MM-DD h:mm A").toISOString();
    } catch (error12h) {
      try {
        // Try 24-hour format (e.g., "14:30", "09:15")
        const startDateTime =
          sessionDay.format("YYYY-MM-DD") + " " + data.startTime;
        const endDateTime =
          sessionDay.format("YYYY-MM-DD") + " " + data.endTime;

        formattedStartTime = dayjs(
          startDateTime,
          "YYYY-MM-DD HH:mm"
        ).toISOString();
        formattedEndTime = dayjs(endDateTime, "YYYY-MM-DD HH:mm").toISOString();
      } catch (error24h) {
        // If both formats fail, log the actual values for debugging
        await logger({
          error: `Failed to parse time values. startTime: "${data.startTime}", endTime: "${data.endTime}"`,
          errorStack: `12h format error: ${error12h}\n24h format error: ${error24h}`,
        });

        return {
          success: false,
          message:
            "Invalid time format. Please use format like '2:30 PM' or '14:30'",
        };
      }
    }

    // Validate that the parsed times are valid
    if (
      !dayjs(formattedStartTime).isValid() ||
      !dayjs(formattedEndTime).isValid()
    ) {
      return {
        success: false,
        message: "Invalid time values provided",
      };
    }

    // Validate that end time is after start time
    if (dayjs(formattedEndTime).isBefore(dayjs(formattedStartTime))) {
      return {
        success: false,
        message: "End time must be after start time",
      };
    }

    const res = await mongodb
      .collection(teacherCollectionName)
      .updateOne({ _id: teacherObjectId, "exam.id": data.examId }, {
        $set: {
          "exam.$.session": {
            sessionDate: data.sessionDate,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            createdAt: new Date(),
          },
        },
      } as any);

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error adding session",
      };
    }

    if (res.modifiedCount === 0) {
      return {
        success: false,
        message: "No changes made to the exam",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Session added successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: "Error adding session",
    };
  }
};
