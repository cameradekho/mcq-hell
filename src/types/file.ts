import { TDocument } from "@/types/common";

import { TUser } from "@/types/user";

export type TFile<TFileUser = TUser["_id"]> = TDocument & {
  name: string;
  type: TFileType;
  url: string;
  user: TFileUser;
  processing_status: TFileProcessingStatus;
};

export type TFileProcessingStatus =
  | "unprocessed"
  | "processing"
  | "processed"
  | "failed";

export type TFileType =
  | "application/pdf"
  | "image/jepg"
  | "image/png"
  | "image/jpg"
  | "image/jpeg"
  | "image/webp"
  | "image/heic"
  | "image/svg+xml";
