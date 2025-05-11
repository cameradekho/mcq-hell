"use client";

import React, { useEffect, useState } from "react";
import { fetchExams } from "../action/fetch-exams";
import { IExam } from "@/models/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard, Copy, Edit2, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { deleteExamById } from "../action/delete-exam-by-id";
import { ITeacher } from "@/models/teacher";
import { fetchTeacherByEmail } from "../action/fetch-teacher-by-email";
import { HiAcademicCap } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  teacherEmail: string;
  onExamDeleted?: () => void; // Callback to refresh dashboard stats
};

export const AllExams = (params: Props) => {
  const [exams, setExams] = useState<
    Pick<IExam, "id" | "name" | "description">[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacher, setTeacher] =
    useState<Pick<ITeacher, "id" | "name" | "email" | "avatar">>();
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchTeacherData() {
      try {
        setIsLoading(true);
        const data = await fetchTeacherByEmail({
          email: params.teacherEmail,
        });

        if (data.success) {
          setTeacher(data.data);
        } else {
          toast.error(data.message || "Failed to fetch teacher");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching teacher");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.teacherEmail) {
      fetchTeacherData();
    }
  }, []);

  useEffect(() => {
    async function fetchExamsData() {
      try {
        setIsLoading(true);
        const data = await fetchExams(params.teacherEmail);
        if (data.success) {
          setExams(data.data);
        } else {
          toast.error(data.message || "Failed to fetch exams");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching exams");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.teacherEmail) {
      fetchExamsData();
    }
  }, [params.teacherEmail]);

  const handleDeleteClick = (examName: string) => {
    setExamToDelete(examName);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;

    try {
      const res = await deleteExamById({
        examName: examToDelete,
      });

      if (res.success) {
        toast.success("Exam deleted successfully!");
        setExams((prev) => prev.filter((exam) => exam.name !== examToDelete));
        setIsDeleteDialogOpen(false);
        setExamToDelete(null);

        // Call the callback to refresh dashboard stats
        if (params.onExamDeleted) {
          params.onExamDeleted();
        }
      } else {
        toast.error(res.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam: " + error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6 text-center">Loading exams...</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search exams..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/add-exam" target="_blank" rel="noopener noreferrer">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add New Exam
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">
                    <div>
                      {exam.name}
                      <p className="md:hidden text-sm text-muted-foreground mt-1 line-clamp-1">
                        {exam.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {exam.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 md:gap-4">
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => {
                              const examLink = `${window.location.origin}/exam/${teacher?.id}/${exam.id}`;
                              navigator.clipboard.writeText(examLink);
                              toast.success("Exam link copied to clipboard!");
                            }}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors p-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Link
                            href={`/result/${teacher?.id}/${exam.id}`}
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors p-2"
                          >
                            <HiAcademicCap className="w-4 h-4" />
                            <span className="sr-only">Results</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Results</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Link
                            href={`/update-exam/${teacher?.id}/${exam.id}`}
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => handleDeleteClick(exam.name)}
                            className="flex items-center text-sm text-muted-foreground hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No exams found matching your search."
                    : "No exams found. Create your first exam!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
