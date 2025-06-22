import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { checkAdmin } from "./check-admin";

export const deleteTicketSchema = z.object({
  _id: z.string(),
});

type DeleteTicketData = z.infer<typeof deleteTicketSchema>;

type DeleteTicketResult = ServerActionResult<undefined>;

export const deleteTicket = async (
  data: DeleteTicketData
): Promise<DeleteTicketResult> => {
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

    let existingTicket;
    if (isAdmin) {
      existingTicket = await mongodb
        .collection<ITicket>(ticketCollectionName)
        .findOne({
          _id: new ObjectId(data._id),
        });
    } else {
      existingTicket = await mongodb
        .collection<ITicket>(ticketCollectionName)
        .findOne({
          _id: new ObjectId(data._id),
          email: session.user.email,
        });
    }

    if (!existingTicket) {
      return {
        success: false,
        message: "Ticket not found or you don't have permission to delete it",
      };
    }

    const deleteFilter = isAdmin
      ? { _id: new ObjectId(data._id) }
      : { _id: new ObjectId(data._id), email: session.user.email };

    const result = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .deleteOne(deleteFilter);

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Failed to delete ticket",
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete ticket",
    };
  }
};
