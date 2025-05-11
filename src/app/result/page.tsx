import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import { fetchResultsByTeacher } from "@/action/res/fetch-results-by-teacher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { auth } from "../../../auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ExamSelect({
  exams,
  defaultValue,
}: {
  exams: any[];
  defaultValue: string;
}) {
  return (
    <form className="mb-8">
      <Select name="examId" defaultValue={defaultValue}>
        <SelectTrigger className="w-full md:w-[300px]">
          <SelectValue placeholder="Select an exam" />
        </SelectTrigger>
        <SelectContent>
          {exams.map((exam) => (
            <SelectItem key={exam.examId} value={exam.examId}>
              {exam.examName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { examId?: string };
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const resultsResponse = await fetchResultsByTeacher({
    teacherEmail: session.user.email,
  });

  const examResults = resultsResponse.success ? resultsResponse.data : [];

  if (examResults.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavigationBar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Exam Results</h1>

          <Card>
            <CardContent className="py-10">
              <p className="text-center text-muted-foreground">
                No exam results found. Either you haven't created any exams yet,
                or no students have taken your exams.
              </p>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Get selected examId from URL or default to first exam
  const selectedExamId = searchParams.examId || examResults[0].examId;
  const selectedExam =
    examResults.find((exam) => exam.examId === selectedExamId) ||
    examResults[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigationBar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Exam Results</h1>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ExamSelect exams={examResults} defaultValue={selectedExamId} />

          <Card>
            <CardHeader>
              <CardTitle>{selectedExam.examName}</CardTitle>
              <CardDescription>{selectedExam.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">
                      Submission Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedExam.studentResults.map((result, index) => (
                    <TableRow key={`${result.studentEmail}-${index}`}>
                      <TableCell className="font-medium">
                        {result.studentName}
                      </TableCell>
                      <TableCell>{result.studentEmail}</TableCell>
                      <TableCell className="text-right">
                        {result.score}/{result.totalMarks}
                      </TableCell>

                      <TableCell className="text-right">
                        {format(new Date(result.submittedAt), "PPP")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
