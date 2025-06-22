import { mongodb } from "@/lib/mongodb";
import { auth } from "../../auth";
import { adminCollectionName, IAdmin } from "@/models/admin";
import { ServerActionResult } from "@/types";

type CheckAdminResponse = ServerActionResult<boolean>;

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

  return {
    success: true,
    data: admin ? true : false,
  };
};
