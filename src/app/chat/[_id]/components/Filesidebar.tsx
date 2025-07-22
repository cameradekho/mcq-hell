"use client";
import React, { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Check,
  Trash,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { is } from "date-fns/locale";
import { fetchTeacherByEmail } from "@/action/fetch-teacher-by-email";
import { ITeacher } from "@/models/teacher";
import { set } from "date-fns";

interface FileType {
  _id: string;
  name: string;
  type: string;
  url: string;
  processing_status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PDFSidebar() {
  const { data: session, status } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] = useState<string>("");

  // Fetch all files on component mount
  useEffect(() => {
    const fetchuserDataByEmail = fetchTeacherByEmail({
      email: session?.user?.email || "",
    });

    if (!fetchuserDataByEmail) {
      toast.error("Error fetching user data. Please try again.");
      return;
    }
    console.log("fetchuserDataByEmail", fetchuserDataByEmail);
    fetchuserDataByEmail.then((data) => {
      if (data.success) {
        setUserId(data?.data?._id?.toString() || "");
        console.log(
          "llllllllwldlowdhiqgdo :",
          data?.data?._id?.toString() || ""
        );
      } else {
        toast.error(data.message || "Error fetching user data.");
      }
    });

    fetchFiles();
  }, []);

  // parsing files after upload after 1.2 seconds
  useEffect(() => {
    const timerId = setTimeout(() => {
      const handleFileParse = async () => {
        try {
          // Use the files state directly instead of calling fetchFiles()
          for (const file of files.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )) {
            if (file.processing_status === "unprocessed") {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_AI_BACKEND_URL}/parse/upload`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    fileId: file._id,
                  }),
                }
              );

              if (response.ok) {
                toast.success(`File ${file.name} parsed successfully.`);
                fetchFiles();
              } else {
                toast.error(
                  `Error parsing file ${file.name}: ${response.statusText}. Please Upload again.`
                );
              }
            }
          }
        } catch (error) {
          console.error("Error parsing files:", error);
          toast.error("Error parsing files: " + error);
        }
      };

      // Only run if files array exists and has items
      if (Array.isArray(files) && files.length > 0) {
        handleFileParse();
      }
    }, 1200);
    return () => clearTimeout(timerId);
  }, [isUploading, isLoading]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_BACKEND_URL}/file/all`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // Debug log
        // Handle different response structures
        if (Array.isArray(data)) {
          setFiles(data);
        } else if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
        } else if (data.data && Array.isArray(data.data)) {
          setFiles(data.data);
        } else {
          console.error("Expected array but got:", typeof data, data);
          setFiles([]);
        }
      } else {
        console.error("Failed to fetch files, status:", response.status);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid file type (PDF or image).");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId); // Add userId to FormData
      console.log("Uploading file with userId:", userId); // Debug log

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_BACKEND_URL}/file/upload`,
        {
          method: "POST",
          body: formData, // Send FormData directly
        }
      );

      console.log("Response status:", response.status); // Debug log

      if (response.ok) {
        const uploadedFile = await response.json();
        console.log("Uploaded file response:", uploadedFile); // Debug log
        // Handle different response structures

        if (uploadedFile) {
          setFiles((prev) => [...prev, uploadedFile]);
        } else {
          console.error("Unexpected upload response structure:", uploadedFile);
          fetchFiles();
        }

        e.target.value = "";
      } else {
        console.error("Failed to upload file", response.status);
        alert("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectionDone = () => {
    const selectedFileObjects = files.filter((file) =>
      selectedFiles.includes(file._id)
    );
    console.log("Selected PDFs:", selectedFileObjects);
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_BACKEND_URL}/file/delete/${fileId}/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file._id !== fileId));
        setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
        toast.success(`File deleted successfully.`);
      } else {
        toast.error(`Error deleting file: ${response.statusText}.`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`Error deleting file: ${error}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading") {
    return <div className="w-80 bg-white shadow-lg p-4">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-80 bg-white shadow-lg p-4">
        <div className="text-center text-red-500">
          You must be logged in to access this feature.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </Button>

      {!isCollapsed && (
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">PDF Manager</h2>
            <p className="text-sm text-gray-600">
              Hello, {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500">
              Teacher Email: {session?.user?.email}
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Upload size={16} />
                Upload PDF
              </h3>
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mb-2"
              />
              {isUploading && (
                <div className="text-sm text-blue-500">Uploading...</div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold">File Gallery</h3>
              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleSelectionDone}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Selection Done ({selectedFiles.length})
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center text-gray-500 py-4">
                  Loading files...
                </div>
              ) : !Array.isArray(files) ? (
                <div className="text-center text-red-500 py-4">
                  Error loading files
                </div>
              ) : files.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No Files uploaded yet
                </div>
              ) : (
                files.map((file) => (
                  <Card
                    key={file._id}
                    className={`cursor-pointer transition-all ${
                      selectedFiles.includes(file._id)
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleFileSelect(file._id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {selectedFiles.includes(file._id) ? (
                            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText
                              size={14}
                              className="text-red-500 flex-shrink-0"
                            />
                            <p className="text-sm font-medium truncate flex-1">
                              {file.name}
                            </p>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDelete(file._id);
                              }}
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0 hover:bg-red-600"
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                          <p className="text-xs flex items-center gap-1">
                            Status:{" "}
                            {/* TODO: Add color based on processing status perfectly */}
                            <span
                              className={`font-medium flex items-center gap-1 ${
                                file.processing_status === "unprocessed"
                                  ? "text-blue-600"
                                  : file.processing_status === "processing"
                                  ? "text-blue-600"
                                  : file.processing_status === "processed"
                                  ? "text-green-600"
                                  : file.processing_status === "failed"
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {(file.processing_status === "processing" ||
                                file.processing_status === "unprocessed") && (
                                <Loader2 size={10} className="animate-spin" />
                              )}
                              {file.processing_status === "unprocessed"
                                ? "processing"
                                : file.processing_status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
