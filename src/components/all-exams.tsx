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

  const handleDelete = async (examName: string) => {
    console.log("Deleting exam with id:", examName);
    try {
      const res = await deleteExamById({
        examName: examName,
      });

      if (res.success) {
        toast.success("Exam deleted successfully!");
        setExams((prev) => prev.filter((exam) => exam.name !== examName));
      } else {
        toast.error(res.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam: " + error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading exams...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
      {exams.length > 0 ? (
        exams.map((exam) => (
          <Card
            key={exam.id}
            className="relative group shadow-md border hover:shadow-xl transition-all duration-200"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{exam.name}</CardTitle>
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
                    onClick={() => handleDelete(exam.name)}
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

      <Link href="/add-exam">
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
  );
};
