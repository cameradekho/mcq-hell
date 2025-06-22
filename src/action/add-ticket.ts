import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";

export const addTicketSchema = z.object({
  message: z.string(),
});

type AddTicketData = z.infer<typeof addTicketSchema>;

type AddTicketResult = ServerActionResult<ITicket>;

export const addTicket = async (
  data: AddTicketData
): Promise<AddTicketResult> => {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const ticketData: ITicket = {
    _id: new ObjectId(),
    ticketId: `T-${uuidv4()}`,
    email: session.user.email,
    message: data.message,
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const ticket = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .insertOne(ticketData);

    if (!ticket.acknowledged) {
      return {
        success: false,
        message: "Failed to add ticket",
      };
    }

    return {
      success: true,
      data: ticketData,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to add ticket",
    };
  }
};
