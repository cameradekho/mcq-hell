import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { mongodb } from "@/lib/mongodb";
import { checkAdmin } from "./check-admin";

export const getTicketSchema = z.object({
  _id: z.string(),
});

type GetTicketData = z.infer<typeof getTicketSchema>;

type GetTicketResult = ServerActionResult<ITicket>;

export const getTicket = async (
  data: GetTicketData
): Promise<GetTicketResult> => {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    const adminCheck = await checkAdmin();
    const isAdmin = adminCheck.success && adminCheck.data;

    const ticket = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .findOne({
        _id: new ObjectId(data._id),
        ...(isAdmin ? {} : { email: session.user.email }),
      });

    if (!ticket) {
      return {
        success: false,
        message: "Ticket not found or you don't have permission to view it",
      };
    }

    return {
      success: true,
      data: ticket,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch ticket",
    };
  }
};
