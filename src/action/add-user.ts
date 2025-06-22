"use server";

import { mongodb } from "@/lib/mongodb";
import { teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { logger } from "@/models/logger";
import { studentCollectionName } from "@/models/student";

export type AddUserResult = ServerActionResult<undefined>;

type AddUserData = {
  name: string;
  email: string;
  avatar: string;
  role: "teacher" | "student";
};

export const addUser = async (data: AddUserData): Promise<AddUserResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    await mongodb.connect();
    console.log("connected hubba");

    // as student present or not
    if (data.role === "student") {
      const studentData = await mongodb
        .collection(studentCollectionName)
        .findOne({ email: data.email });

      if (studentData) {
        return {
          success: false,
          message: "Student already exists",
        };
      }
    }

    //as teacher present or not
    if (data.role === "teacher") {
      const teacherData = await mongodb
        .collection(teacherCollectionName)
        .findOne({ email: data.email });

      if (teacherData) {
        return {
          success: false,
          message: "Teacher already exists",
        };
      }
    }

    // if role is student enter at DB as student
    if (data.role === "student") {
      const studentData = await mongodb
        .collection(studentCollectionName)
        .insertOne({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: "student",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      if (!studentData.acknowledged) {
        return {
          success: false,
          message: "Error adding student",
        };
      }
      return {
        success: true,
        data: studentData.acknowledged as any,
        message: "Student added successfully",
      };
    }

    // if role is teacher enter at DB as teacher
    if (data.role === "teacher") {
      const teacherData = await mongodb
        .collection(teacherCollectionName)
        .insertOne({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: "teacher",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      if (!teacherData.acknowledged) {
        return {
          success: false,
          message: "Error adding teacher",
        };
      }
      return {
        success: true,
        data: teacherData.acknowledged as any,
        message: "Teacher added successfully",
      };
    }

    if (data.role === "student") {
      return {
        success: true,
        data: undefined,
        message: "Student added successfully",
      };
    }
    return {
      success: true,
      data: undefined,
      message: "Teacher added successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error adding user: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
