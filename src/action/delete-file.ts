"use server";

import { deleteObject, generatePresignedDownloadUrl } from "@/lib/aws";
import { ServerActionResult } from "@/types";
import { auth } from "../../auth";
import { logger } from "@/models/logger";

export type DeleteFileResult = ServerActionResult<{
  fileKey: string;
  deleted: boolean;
}>;

type DeleteFileData = {
  fileKey: string;
};

export const deleteFile = async (
  data: DeleteFileData
): Promise<DeleteFileResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to delete files.",
      };
    }

    if (!data.fileKey || data.fileKey.trim() === "") {
      return {
        success: false,
        message: "File key is required.",
      };
    }

    const deleted = await deleteObject(data.fileKey);

    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete file from storage.",
      };
    }

    return {
      success: true,
      data: {
        fileKey: data.fileKey,
        deleted: true,
      },
      message: "File deleted successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error deleting file: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};

export type GetDownloadUrlResult = ServerActionResult<{
  downloadUrl: string;
  fileKey: string;
}>;

type GetDownloadUrlData = {
  fileKey: string;
  expiresIn?: number;
};

export const generateDownloadUrl = async (
  data: GetDownloadUrlData
): Promise<GetDownloadUrlResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be logged in to access files.",
      };
    }

    if (!data.fileKey || data.fileKey.trim() === "") {
      return {
        success: false,
        message: "File key is required.",
      };
    }

    const downloadUrl = await generatePresignedDownloadUrl(
      data.fileKey,
      data.expiresIn || 3600
    );

    return {
      success: true,
      data: {
        downloadUrl,
        fileKey: data.fileKey,
      },
      message: "Download URL generated successfully",
    };
  } catch (error: any) {
    await logger({
      error,
      errorStack: error.stack,
    });
    return {
      success: false,
      message: `Error generating download URL: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};
