"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { fetchExamSessionByExamId } from "./fetch-session-by-examId";
import { examsessionCollectionName } from "@/models/teacher-exam-session";

export type AddSessionInExamResult = ServerActionResult<undefined>;

export type AddSessionInExamData = {
  teacherId: string;
  examId: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
};

export const addExamSession = async (
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
      console.log("teacherId", data.teacherId);
      console.log("examId", data.examId);
      console.log("sessionDate", data.sessionDate);
      console.log("startTime", data.startTime);
      console.log("endTime", data.endTime);
      return {
        success: false,
        message:
          "Please provide examId, sessionDate, startTime, endTime and teacherId",
      };
    }

    await mongodb.connect();

    // Convert sessionDate to dayjs object for date manipulation
    const sessionDay = dayjs(data.sessionDate);

    let formattedStartTime: string;
    let formattedEndTime: string;

    try {
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

    const examSessionExists = await fetchExamSessionByExamId({
      examId: data.examId,
      teacherId: data.teacherId,
    });
    // if the Exam's Session already exists, update it
    if (examSessionExists.success) {
      await mongodb.collection(examsessionCollectionName).deleteOne({
        _id: examSessionExists.data._id,
      });

      // Insert a new document with a new _id

      console.log("Hubba Teacher ID", data.teacherId);
      const res = await mongodb
        .collection(examsessionCollectionName)
        .insertOne({
          examId: new ObjectId(data.examId),
          teacherId: new ObjectId(data.teacherId),
          sessionDate: data.sessionDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      if (!res.acknowledged) {
        return {
          success: false,
          message: "Error updating session",
        };
      }

      return {
        success: true,
        data: undefined,
        message: "Session updated successfully",
      };
    }

    // if the Exam's Session doesn't exist, create it
    const res = await mongodb.collection(examsessionCollectionName).insertOne({
      examId: new ObjectId(data.examId),
      teacherId: new ObjectId(data.teacherId),
      sessionDate: data.sessionDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      createdAt: new Date(),
    });

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error adding session",
      };
    }

    if (res.insertedId === null) {
      return {
        success: false,
        message: "Error adding session",
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
