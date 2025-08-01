"use server";

import { mongodb } from "@/lib/mongodb";
import { ITicket, ticketCollectionName } from "@/models/ticket";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { checkAdmin } from "./check-admin";

type GetTicketsResult = ServerActionResult<ITicket[]>;

type GetTicketsData = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "closed" | "all";
};

export const getTickets = async (
  data?: GetTicketsData
): Promise<GetTicketsResult> => {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const adminCheck = await checkAdmin();
  const isAdmin = adminCheck.success;

  try {
    const { page = 1, limit = 10, search = "", status = "all" } = data || {};

    const baseFilter = isAdmin ? {} : { email: session.user.email };

    let searchFilter = {};
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      searchFilter = {
        $or: [
          { ticketId: searchRegex },
          { email: searchRegex },
          { message: searchRegex },
          { status: searchRegex },
        ],
      };
    }

    let statusFilter = {};
    if (status && status !== "all") {
      statusFilter = { status };
    }

    const filters = [baseFilter];
    if (search && search.trim()) {
      filters.push(searchFilter);
    }
    if (status && status !== "all") {
      filters.push(statusFilter);
    }

    const finalFilter = filters.length > 1 ? { $and: filters } : filters[0];

    const skip = (page - 1) * limit;

    const totalCount = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .countDocuments(finalFilter);

    const totalPages = Math.ceil(totalCount / limit);

    const tickets = await mongodb
      .collection<ITicket>(ticketCollectionName)
      .find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      success: false,
      message: "Failed to fetch tickets",
    };
  }
};
