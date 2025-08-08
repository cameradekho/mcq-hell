"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, Trash, Loader2, CloudUpload } from "lucide-react";

import {
  useDeleteFileById,
  useGetAllFileByUserId,
  useGetAllFiles,
  useUploadFile,
} from "@/hooks/api/file";
import { invalidateQueries } from "@/lib/query-client";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchTeacherByEmail } from "@/action/fetch-teacher-by-email";
import Link from "next/link";

type FileSidebarProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  setSelectedFileIds: (selectedFileIds: string[]) => void;
};

export const FileSidebar = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  setSelectedFileIds,
}: FileSidebarProps) => {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function getUserId() {
      if (!session?.user?.email) {
        return;
      }
      const user = await fetchTeacherByEmail({
        email: session?.user?.email,
      });

      if (!user.success) {
        return;
      }
      user.data._id && setUserId(user?.data._id?.toString());
    }

    if (session?.user?.email) {
      getUserId();
    }
  }, []);

  const {
    data: filesByUserId,
    isLoading: isLoadingFilesByUserId,
    error: errorFilesByUserId,
  } = useGetAllFileByUserId(
    { userId: userId },
    {
      enabled: isOpen,
    }
  );

  console.log("FEtchd file by userId", filesByUserId);

  const { mutate: deleteFileById } = useDeleteFileById({
    onSuccess: () => {
      invalidateQueries({
        queryKey: ["useGetAllFiles"],
      });
    },
  });

  const { mutate: uploadFile } = useUploadFile({
    onSuccess: (data) => {
      invalidateQueries({
        queryKey: ["useGetAllFiles"],
      });
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          uploadFile({ file, userId: userId });
          toast.success(`${file.name} uploaded successfully.`);
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [userId]
  );
  const deleteFile = (fileId: string) => {
    deleteFileById({ fileId: fileId });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const handleToggle = (_id: string) => {
    if (selectedFileIds.includes(_id)) {
      setSelectedFileIds(selectedFileIds.filter((id) => id !== _id));
    } else {
      setSelectedFileIds([...selectedFileIds, _id]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">File Manager</h2>
            <p className="text-sm text-muted-foreground">
              Upload and manage your documents
            </p>
          </div>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <CloudUpload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary">Drop files here...</p>
            ) : (
              <div>
                <p className="mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, PNG, JPG files supported
                </p>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoadingFilesByUserId ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading files...</span>
              </div>
            ) : filesByUserId?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No files uploaded yet
              </div>
            ) : (
              filesByUserId?.data?.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Checkbox */}
                  <Checkbox
                    id={file._id}
                    checked={selectedFileIds.includes(file._id)}
                    onCheckedChange={() => handleToggle(file._id)}
                  />

                  {/* File Icon */}
                  <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    {/* File Name */}
                    <Link
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-blue-600 dark:text-blue-400 truncate hover:underline"
                    >
                      {file.name}
                    </Link>

                    {/* Status and Date */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className={`flex items-center gap-1 ${getStatusColor(
                          file.processing_status
                        )}`}
                      >
                        {(file.processing_status === "processing" ||
                          file.processing_status === "unprocessed") && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {file.processing_status === "unprocessed"
                          ? "processing"
                          : file.processing_status}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteFile(file._id)}
                    disabled={
                      file.processing_status === "unprocessed" ||
                      file.processing_status === "processing"
                    }
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
