import { CoreMessage } from "ai";

import { TDocument } from "./common";

import { TFile } from "./file";
import { TUser } from "./user";

export type TConversation<TConversationUser = TUser["_id"]> = TDocument & {
  name: string;
  user: TConversationUser;
};

export type TMessage<
  TMessageFile = TFile["_id"],
  TMessageConversation = TConversation["_id"]
> = TDocument & {
  role: TMessageRole;
  content: CoreMessage["content"];
  files?: TMessageFile[];
  conversation: TMessageConversation;
};

export type TMessageRole = "system" | "user" | "assistant" | "tool";

export type TMessagePart =
  | {
      type: "text";
      data: string;
    }
  | {
      type: "tag";
      name: string;
      data: Record<string, unknown>;
    };
