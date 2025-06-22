"use server";

import { mongodb } from "@/lib/mongodb";
import { auth } from "../../auth";
import { adminCollectionName, IAdmin } from "@/models/admin";
import { ServerActionResult } from "@/types";

type CheckAdminResponse = ServerActionResult<undefined>;

export const checkAdmin = async (): Promise<CheckAdminResponse> => {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const admin = await mongodb.collection<IAdmin>(adminCollectionName).findOne({
    email: session.user.email,
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin not found",
    };
  }

  return {
    success: true,
    data: undefined,
  };
};
