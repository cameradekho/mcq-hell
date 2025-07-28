"use client";

import React, { useEffect, useState } from "react";
import { fetchExams } from "../action/fetch-exams";
import { IExam } from "@/models/exam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Clapperboard,
  Copy,
  Edit2,
  Trash2,
  Plus,
  Search,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { deleteExamById } from "../action/delete-exam-by-id";
import { ITeacher } from "@/models/teacher";
import { fetchTeacherByEmail } from "../action/fetch-teacher-by-email";
import { HiAcademicCap } from "react-icons/hi";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  teacherId: string;
  // onExamDeleted?: () => void; // Callback to refresh dashboard stats
};

export const AllExams = (params: Props) => {
  const [exams, setExams] = useState<
    Pick<IExam, "_id" | "name" | "description">[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacher, setTeacher] =
    useState<Pick<ITeacher, "_id" | "name" | "email" | "avatar">>();
  const [examIDToDelete, setExamIDToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  console.log("-> teacherId: ", params.teacherId);

  // useEffect(() => {
  //   async function fetchTeacherData() {
  //     try {
  //       setIsLoading(true);
  //       const data = await fetchTeacherByEmail({
  //         email: params.teacherId,
  //       });

  //       if (data.success) {
  //         setTeacher(data.data);
  //       } else {
  //         toast.error(data.message || "Failed to fetch teacher");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Error fetching teacher");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   if (params.teacherId) {
  //     fetchTeacherData();
  //   }
  // }, []);

  useEffect(() => {
    async function fetchExamsData() {
      try {
        setIsLoading(true);
        const data = await fetchExams({
          teacherId: params.teacherId,
        });
        console.log("exams: ", data);
        if (data.success) {
          setExams(data.data.map((exam) => ({ ...exam, id: exam._id })));
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

    if (params.teacherId) {
      fetchExamsData();
    }
  }, [params.teacherId]);

  const handleDeleteClick = (examId: string) => {
    if (!examId) return;
    setExamIDToDelete(examId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examIDToDelete) return;

    try {
      console.log("teacherId: ", params.teacherId);
      console.log("examId: ", examIDToDelete);
      const res = await deleteExamById({
        examId: examIDToDelete,
        teacherId: params.teacherId,
      });

      if (res.success) {
        toast.success("Exam deleted successfully!");
        setExams((prev) =>
          prev.filter((exam) => exam?._id?.toString() !== examIDToDelete)
        );
        setIsDeleteDialogOpen(false);
        setExamIDToDelete(null);
      } else {
        toast.error(res.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam: " + error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setExamIDToDelete(null);
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
    <div className="w-full min-h-[45vh] max-h-max space-y-4">
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
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/add-exam" target="_blank" rel="noopener noreferrer">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Exam
            </Button>
          </Link>

          <Link
            // href={`/add-exam-by-ai/${teacher?._id}`}
            href={"/chat"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full sm:w-auto">
              <Bot className="w-4 h-4 mr-2" />
              Add New Exam By AI
            </Button>
          </Link>
        </div>
      </div>

      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredExams.map((exam, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border hover:border-primary/20"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base font-semibold text-foreground line-clamp-2 leading-tight">
                  {exam.name}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm line-clamp-3 text-muted-foreground">
                  {exam.description}
                </CardDescription>
              </CardHeader>

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Copy Link */}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover:scale-110"
                    asChild
                    title="View results"
                  >
                    <Link
                      href={`/copy-exam-link/${params.teacherId}/${exam._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </Button>

                  {/* Results */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover:scale-110"
                    asChild
                    title="View results"
                  >
                    <Link
                      href={`/result/${params.teacherId}/${exam._id}`}
                      rel="noopener noreferrer"
                    >
                      <HiAcademicCap className="h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </Button>

                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover:scale-110"
                    asChild
                    title="Edit exam"
                  >
                    <Link
                      href={`/update-exam/${
                        params.teacherId
                      }/${exam?._id?.toString()}`}
                      rel="noopener noreferrer"
                    >
                      <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-200 hover:scale-110"
                    onClick={() =>
                      handleDeleteClick(exam._id?.toString() || "")
                    }
                    title="Delete exam"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground">
              {searchQuery
                ? "No exams found matching your search."
                : "No exams found. Create your first exam!"}
            </div>
            {!searchQuery && (
              <Button className="mt-4" asChild>
                <a href="/add-exam" target="_blank" rel="noopener noreferrer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Exam
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
