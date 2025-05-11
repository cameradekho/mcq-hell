"use server";
import { mongodb } from "@/lib/mongodb";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { getUser } from "./get-user";
import { ITeacher } from "@/models/teacher";

export type DeleteUserByEmailResult = ServerActionResult<undefined>;

export type DeleteUserByEmailData = {
  email: string;
};

export const deleteUserByEmail = async (data: DeleteUserByEmailData) => {
  try {
    if (!data?.email) {
      return {
        success: false,
        message: "Invalid email or type provided",
      };
    }

    const existingUser = await getUser({ email: data.email });

    if (!existingUser.success) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await mongodb.connect();
    const res = await mongodb.collection("user").deleteOne({
      email: data.email,
    });

    if (!res.acknowledged) {
      return {
        success: false,
        message: "Error deleting user",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    await logger({
      error: error.message,
      errorStack: error.stack,
    });

    return {
      success: false,
      message: "Something went wrong while deleting User",
    };
  }
};
