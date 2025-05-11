"use server";

import { ITeacher, teacherCollectionName } from "@/models/teacher";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";

export type GetUserResult = ServerActionResult<
  Pick<ITeacher, "id" | "name" | "email" | "avatar">
>;

export type GetUserData = {
  email: string;
};

export const getUser = async (data: GetUserData): Promise<GetUserResult> => {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to get a user",
      };
    }

    await mongodb.connect();
    const user = await mongodb.collection(teacherCollectionName).findOne({
      email: session?.user?.email,
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    return {
      success: true,
      data: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        avatar: user?.avatar,
      } as unknown as Pick<ITeacher, "id" | "name" | "email" | "avatar">,
      message: "User found",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });

    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
