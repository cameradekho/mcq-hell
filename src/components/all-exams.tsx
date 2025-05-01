"use client";

import React, { useEffect, useState } from "react";
import { fetchExams } from "../../action/fetch-exams";
import { IExam } from "@/models/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard, Copy, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExamById } from "../../action/delete-exam-by-id";
import { ITeacher } from "@/models/teacher";
import { fetchTeacherByEmail } from "../../action/fetch-teacher-by-email";
import { HiAcademicCap } from "react-icons/hi";
import { ConfirmationDialog } from "./confirmation-dialog";

type Props = {
  teacherEmail: string;
};

export const AllExams = (params: Props) => {
  const [exams, setExams] = useState<
    Pick<IExam, "id" | "name" | "description">[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacher, setTeacher] =
    useState<Pick<ITeacher, "id" | "name" | "email" | "avatar">>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, [params.teacherEmail]); // Added userEmail dependency

  const handleOpenDeleteDialog = (examName: string) => {
    setExamToDelete(examName);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      setIsDeleting(true);
      const res = await deleteExamById({
        examName: examToDelete,
      });

      if (res.success) {
        toast.success("Exam deleted successfully!");
        setExams((prev) => prev.filter((exam) => exam.name !== examToDelete));
        setDeleteDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam: " + error);
    } finally {
      setIsDeleting(false);
      setExamToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading exams...</div>;
  }

  return (
    <>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        loading={isDeleting}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <Card
              key={exam.id}
              className="relative group shadow-md border hover:shadow-xl transition-all duration-200"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">
                    {exam.name}
                  </CardTitle>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const examLink = `${window.location.origin}/exam/${teacher?.id}/${exam.id}`;
                        navigator.clipboard.writeText(examLink);
                        toast.success("Exam link copied to clipboard!");
                      }}
                      className="text-amber-500 group-hover:scale-105 transition-all ease-in-out duration-200"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    <Link
                      href={`/result/${teacher?.id}/${exam.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {}}
                        className="text-lime-500 group-hover:scale-105 transition-all ease-in-out duration-200"
                      >
                        <HiAcademicCap className=" text-2xl" />
                      </Button>
                    </Link>

                    <Link
                      href={`/update-exam/${teacher?.id}/${exam.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 group-hover:scale-105 transition-all ease-in-out duration-200"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteDialog(exam.name)}
                      className="text-red-500 group-hover:scale-105 transition-all ease-in-out duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-left">
                  {exam.description}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No exams found. Create your first exam!
          </div>
        )}

        <Link href="/add-exam" target="_blank" rel="noopener noreferrer">
          <Card className="flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 border hover:scale-105 cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold">
                Add Exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-5xl text-center">+</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
};
