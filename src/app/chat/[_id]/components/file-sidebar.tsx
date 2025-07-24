"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, Trash, Loader2, CloudUpload } from "lucide-react";
import { fetchTeacherByEmail } from "@/action/fetch-teacher-by-email";
import { env } from "@/constants/env";
import { TFile } from "@/types/file";

type FileSidebarProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const FileSidebar = ({ isOpen, onOpenChange }: FileSidebarProps) => {
  const { data: session } = useSession();
  const [files, setFiles] = useState<TFile<string>[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Get user ID
  useEffect(() => {
    if (!session?.user?.email) return;

    fetchTeacherByEmail({ email: session.user.email })
      .then((data) => {
        if (data.success) {
          setUserId(data?.data?._id?.toString() || "");
          fetchFiles(data?.data?._id?.toString() || "");
        } else {
          toast.error(data.message || "Error fetching user data.");
        }
      })
      .catch(() => {
        toast.error("Error fetching user data. Please try again.");
      });
  }, [session?.user?.email]);

  // Auto-parse uploaded files
  useEffect(() => {
    if (!files.length) return;

    const timer = setTimeout(async () => {
      for (const file of files.filter(
        (f) => f.processing_status === "unprocessed"
      )) {
        try {
          await axios.post(`${env.aiBackendUrl}/parse/upload`, {
            fileId: file._id,
          });
          toast.success(`File ${file.name} parsed successfully.`);
          fetchFiles(userId);
        } catch (error) {
          toast.error(`Error parsing file ${file.name}. Please upload again.`);
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [files, userId]);

  const fetchFiles = async (id: string) => {
    if (!id) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(`${env.aiBackendUrl}/file/all`);

      const fileList = Array.isArray(data)
        ? data
        : Array.isArray(data.files)
        ? data.files
        : Array.isArray(data.data)
        ? data.data
        : [];

      setFiles(fileList);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!userId) {
        toast.error("User not loaded. Please try again.");
        return;
      }

      for (const file of acceptedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId);

          const { data } = await axios.post(
            `${env.aiBackendUrl}/file/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          if (data?._id) {
            setFiles((prev) => [...prev, data]);
            toast.success(`${file.name} uploaded successfully.`);
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [userId]
  );

  const deleteFile = async (fileId: string) => {
    try {
      await axios.delete(`${env.aiBackendUrl}/file/delete/${fileId}/${userId}`);
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      toast.success("File deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting file.");
    }
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No files uploaded yet
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center gap-3 border rounded-lg p-2"
                >
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs">
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
                      <span className="text-muted-foreground">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteFile(file._id)}
                    disabled={
                      file.processing_status === "unprocessed" ||
                      file.processing_status === "processing"
                    }
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
