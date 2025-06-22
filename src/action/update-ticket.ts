import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { checkAdmin } from "./check-admin";

export const updateTicketSchema = z.object({
  ticketId: z.string(),
  message: z.string().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

type UpdateTicketData = z.infer<typeof updateTicketSchema>;

type UpdateTicketResult = ServerActionResult<ITicket>;

export const updateTicket = async (
  data: UpdateTicketData
): Promise<UpdateTicketResult> => {
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
          ticketId: data.ticketId,
        });
    } else {
      existingTicket = await mongodb
        .collection<ITicket>(ticketCollectionName)
        .findOne({
          ticketId: data.ticketId,
          email: session.user.email,
        });
    }

    if (!existingTicket) {
      return {
        success: false,
        message: "Ticket not found or you don't have permission to update it",
      };
    }

    // Prepare update data
    const updateData: Partial<ITicket> = {
      updatedAt: new Date(),
    };

    if (data.message !== undefined) {
      updateData.message = data.message;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    // Update the ticket
    const updateFilter = isAdmin
      ? { ticketId: data.ticketId }
      : { ticketId: data.ticketId, email: session.user.email };

    const result = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .updateOne(updateFilter, {
        $set: updateData,
      });

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: "Failed to update ticket",
      };
    }

    // Fetch the updated ticket
    const updatedTicket = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .findOne(updateFilter);

    if (!updatedTicket) {
      return {
        success: false,
        message: "Failed to retrieve updated ticket",
      };
    }

    return {
      success: true,
      data: updatedTicket,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update ticket",
    };
  }
};
