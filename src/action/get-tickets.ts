import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { checkAdmin } from "./check-admin";

type GetTicketsResult = ServerActionResult<ITicket[]>;

export const getTickets = async (): Promise<GetTicketsResult> => {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const adminCheck = await checkAdmin();
  const isAdmin = adminCheck.success && adminCheck.data;

  try {
    const tickets = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .find(isAdmin ? {} : { email: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: tickets,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch tickets",
    };
  }
};
