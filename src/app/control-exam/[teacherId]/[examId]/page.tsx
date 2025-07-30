"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ObjectId } from "mongodb";
import {
  Search,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchStudentExamSessionByTeachId } from "@/action/session/student/fetch-student-exam-session-by-teacherId";
import { toast } from "sonner";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import { updateStudentExamSessionByTeacher } from "@/action/session/student/update-student-exam-session-by-teacherId";
import { Button } from "@/components/ui/button";

// Types
export type IStudentExamSession = {
  _id?: ObjectId;
  studentId: ObjectId;
  examId: ObjectId;
  teacherId: ObjectId;
  examSessionId: ObjectId;
  status: "not-started" | "started" | "completed" | "block";
  createdAt: Date;
  updatedAt: Date;
  studentDetail: {
    studentName: string;
    studentEmail: string;
    studentAvatar: string;
  };
};

type StatusFilter = "all" | "not-started" | "started" | "completed" | "block";

const ITEMS_PER_PAGE = 15;

const page = () => {
  // State management
  const [studentSession, setStudentSession] = useState<
    IStudentExamSession[] | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const { examId, teacherId } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch student sessions
  useEffect(() => {
    if (!session) {
      toast.error("Please sign in to access this page");
      return;
    }
  }, [session]);

  useEffect(() => {
    const fetchExamsStudent = async () => {
      if (!examId || !teacherId || !session?.user?.email) return;

      setLoading(true);
      try {
        console.log("Fetching teacher data...");
        const teacherData = await fetchTeacherById({
          teacherId: teacherId as string,
        });

        if (!teacherData?.success) {
          toast.error(teacherData?.message || "Failed to fetch teacher data");
          return;
        }

        // More robust ID comparison
        const teacherIdMatch =
          teacherData.data._id?.toString() === (teacherId as string);
        const emailMatch = teacherData.data.email === session.user.email;

        if (!teacherIdMatch || !emailMatch) {
          console.log("Unauthorized access attempt", {
            teacherData,
            teacherId,
            userEmail: session.user.email,
          });
          toast.error("You cannot access this page--");
          router.push("/");
          return;
        }

        console.log("Fetching student exam sessions...");
        const data = await fetchStudentExamSessionByTeachId({
          teacherId: teacherId as string,
          examId: examId as string,
        });

        if (!data?.success) {
          console.log("Fetch failed:", data);
          toast.error(data?.message || "Failed to fetch exam sessions");
        } else {
          setStudentSession(data.data as IStudentExamSession[]);
          console.log("Successfully fetched data:", data);
        }
      } catch (error: any) {
        console.error("Error in fetchExamsStudent:", error);
        toast.error(error?.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email && examId && teacherId) {
      fetchExamsStudent();
    }
  }, [examId, teacherId, session?.user?.email, router]);

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    if (!studentSession) return [];

    return studentSession.filter((student) => {
      const matchesSearch =
        student.studentDetail.studentName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        student.studentDetail.studentEmail
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [studentSession, debouncedSearchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Status counts
  const statusCounts = useMemo(() => {
    if (!studentSession) return { started: 0, total: 0 };

    const started = studentSession.filter((s) => s.status === "started").length;
    return { started, total: studentSession.length };
  }, [studentSession]);

  // Handle status change
  const handleStatusChange = async (
    studentId: ObjectId,
    newStatus: "block" | "not-started"
  ) => {
    try {
      // Add your API call here to update status
      // await updateStudentStatus(studentId, newStatus);

      setStudentSession((prev) =>
        prev
          ? prev.map((student) =>
              student.studentId === studentId
                ? { ...student, status: newStatus }
                : student
            )
          : null
      );

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusVariant = (status: string) => {
      switch (status) {
        case "not-started":
          return "secondary";
        case "started":
          return "default";
        case "completed":
          return "success";
        case "block":
          return "destructive";
        default:
          return "secondary";
      }
    };

    return (
      <Badge variant={getStatusVariant(status) as any}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const handleUpdateStudentExamSession = async (
    teacherId: string,
    examId: string,
    studentId: string,
    newStatus: "block" | "not-started"
  ) => {
    try {
      console.log(
        "handleUpdateStudentExamSession ->",
        teacherId,
        examId,
        studentId,
        newStatus
      );
      const res = await updateStudentExamSessionByTeacher({
        teacherId: teacherId as string,
        examId: examId as string,
        studentId: studentId as string,
        status: newStatus,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.log(error.message);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>{/* <AuthButtons /> */}</CardContent>
        </Card>
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Exam Control Panel
          </h1>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-green-600">
                        {statusCounts.started}
                      </span>{" "}
                      students started
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Total:{" "}
                      <span className="font-medium">{statusCounts.total}</span>{" "}
                      students
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value: StatusFilter) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="started">Started</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="block">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student._id?.toString()}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={student.studentDetail.studentAvatar}
                              alt={student.studentDetail.studentName}
                            />
                            <AvatarFallback>
                              {student.studentDetail.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.studentDetail.studentName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.studentDetail.studentEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>
                      <TableCell>
                        {student.status === "not-started" ||
                        student.status === "block" ||
                        student.status === "started" ||
                        student.status === "completed" ? (
                          <Select
                            value={student.status}
                            onValueChange={(value: "block" | "not-started") =>
                              handleStatusChange(student.studentId, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select the status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="not-started"
                                onClick={() =>
                                  handleUpdateStudentExamSession(
                                    teacherId as string,
                                    examId as string,
                                    student.studentId.toString(),
                                    "not-started"
                                  )
                                }
                              >
                                Not Started
                              </SelectItem>
                              <SelectItem
                                value="block"
                                onClick={() =>
                                  handleUpdateStudentExamSession(
                                    teacherId as string,
                                    examId as string,
                                    student.studentId.toString(),
                                    "block"
                                  )
                                }
                              >
                                {/* <Button>Block</Button> */}
                                Block
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No actions available
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {paginatedStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    No students found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {debouncedSearchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No students have been assigned to this exam yet."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredStudents.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredStudents.length}</span>{" "}
                  results
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={pageNumber === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default page;
