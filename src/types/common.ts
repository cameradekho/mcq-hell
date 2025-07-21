import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { type LucideProps } from "lucide-react";

export type LucideIconType = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export type TObjectId = string;

export type TDocument = {
  _id: TObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type TStatusKey = "unprocessed" | "processing" | "processed" | "failed";

export type TRenderType = "text" | "csv" | "react" | "markdown" | "html";
