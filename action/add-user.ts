"use server";

import { mongodb } from "@/lib/mongodb";
import { teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";
import { auth } from "../auth";
import { logger } from "@/models/logger";
import { nanoid } from "nanoid";

export type AddUserResult = ServerActionResult<undefined>;

type AddUserData = {
  name: string;
  email: string;
  avatar: string;
};

export const addUser = async (data: AddUserData): Promise<AddUserResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to add a user",
      };
    }

    await mongodb.connect();
    const userData = await mongodb
      .collection(teacherCollectionName)
      .findOne({ email: session?.user.email });

    if (userData) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    console.log("data is : ", data);

    const res = await mongodb.collection(teacherCollectionName).insertOne({
      id: nanoid(),
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("result is : ", res.acknowledged);

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error adding user one",
      };
    }
    return {
      success: true,
      data: res.acknowledged as any,
      message: "User added successfully",
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
