import { ObjectId } from "mongodb";

export type ITicket = {
  _id: ObjectId;
  ticketId: string;
  email: string;
  message: string;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
};

export const ticketCollectionName = "ticket";
