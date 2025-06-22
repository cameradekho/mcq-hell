"use server";

import {
  generatePresignedUploadUrl,
  generateUniqueKey,
  getPublicUrl,
} from "@/lib/aws";
import { logger } from "@/models/logger";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";

export type UploadFileResult = ServerActionResult<{
  presignedUrl: string;
  fileKey: string;
  publicUrl: string;
}>;

type UploadFileData = {
  fileName: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
};

export const generateUploadUrl = async (
  data: UploadFileData
): Promise<UploadFileResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to upload files.",
      };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(data.contentType)) {
      return {
        success: false,
        message:
          "File type not allowed. Please upload images, PDFs, or documents.",
      };
    }

    const fileKey = generateUniqueKey(data.fileName, data.folder);

    const presignedUrl = await generatePresignedUploadUrl(
      fileKey,
      data.contentType,
      data.expiresIn || 3600 // Default 1 hour
    );

    const publicUrl = getPublicUrl(fileKey);

    return {
      success: true,
      data: {
        presignedUrl,
        fileKey,
        publicUrl,
      },
      message: "Upload URL generated successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error generating upload URL: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
