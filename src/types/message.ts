import { TDocument } from "./common";

import { TFile } from "./file";
import { TUser } from "./user";

export type TConversation<TConversationUser = TUser["_id"]> = TDocument & {
  name: string;
  user: TConversationUser;
};

export type TextContent = {
  type: "text";
  text: string;
};

export type TagContent = {
  type: "tag";
  text: string;
};

export type TMessage<
  TMessageFile = TFile["_id"],
  TMessageConversation = TConversation["_id"]
> = TDocument & {
  role: TMessageRole;
  content: (TextContent | TagContent)[];
  files?: TMessageFile[];
  conversation: TMessageConversation;
};

export type TMessageRole = "system" | "user" | "assistant" | "tool";

// export type TMessagePart = TextContent | TagContent
export type TMessagePart = TMessage["content"][number];
