"use server";

import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { ServerActionResult } from "@/types";
import { checkAdmin } from "./check-admin";

const updateTicketSchema = z.object({
  _id: z.string().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

type UpdateTicketData = z.infer<typeof updateTicketSchema>;

type UpdateTicketResult = ServerActionResult<ITicket>;

export const updateTicket = async (
  data: UpdateTicketData
): Promise<UpdateTicketResult> => {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin.success) {
      return {
        success: false,
        message: "You are not authorized to update tickets",
      };
    }

    const result = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .updateOne(
        { _id: new ObjectId(data._id) },
        {
          $set: {
            status: data.status,
          },
        }
      );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: "Failed to update ticket",
      };
    }

    const updatedTicket = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .findOne({ _id: new ObjectId(data._id) });

    if (!updatedTicket) {
      return {
        success: false,
        message: "Failed to retrieve updated ticket",
      };
    }

    return {
      success: true,
      data: updatedTicket,
      message: "Ticket status updated",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update ticket",
    };
  }
};
