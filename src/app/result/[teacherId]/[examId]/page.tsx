"use client";
import { IExam } from "@/models/exam";
import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../action/fetch-exam-by-id";
import { useParams } from "next/navigation";
import {
  ExamResultWithStudentInfo,
  fetchResultByTeacherIdExamId,
  IScores,
} from "../../../../action/res/fetch-result-by-teacherId-examId";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormattedResultData = {
  studentName: string;
  studentEmail: string;
  scores: IScores[];
};

const Page = () => {
  const { teacherId, examId } = useParams() as {
    teacherId: string;
    examId: string;
  };
  const [examData, setExamData] = useState<IExam>();
  const [resultData, setResultData] = useState<ExamResultWithStudentInfo[]>();
  const [formattedResultData, setFormattedResultData] = useState<
    FormattedResultData[]
  >([]);
  const [selectedStudent, setSelectedStudent] =
    useState<FormattedResultData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [expandedScoreIndex, setExpandedScoreIndex] = useState<number | null>(
    null
  );

  const [sortResultByDate, setSortResultByDate] = useState<boolean>(true);

  useEffect(() => {
    async function getExamData() {
      try {
        const examData = await fetchExamById({ teacherId, examId });
        if (examData.success) {
          setExamData(examData.data);
        } else {
          console.log("error: ", examData.message);
        }

        const studentsResponseDatas = await fetchResultByTeacherIdExamId({
          teacherId,
          examId,
        });

        if (studentsResponseDatas.success && studentsResponseDatas.data) {
          const grouped: Record<string, FormattedResultData> = {};

          studentsResponseDatas.data.forEach((curr) => {
            if (grouped[curr.studentEmail]) {
              grouped[curr.studentEmail].scores.push(curr.scores);
            } else {
              grouped[curr.studentEmail] = {
                studentEmail: curr.studentEmail,
                studentName: curr.studentName,
                scores: [curr.scores],
              };
            }
          });

          const formattedRes = Object.values(grouped);
          setFormattedResultData(formattedRes);

          console.log(
            "Formatted Results:",
            formattedRes.map((item) => item.scores)
          );

          console.log(
            "Formatted Results Image:",
            formattedRes.map((item) =>
              item?.scores?.map((score) =>
                score?.responses?.map((response) => response.image)
              )
            )
          );
        } else {
          console.log("error: ", studentsResponseDatas.message);
        }
      } catch (error) {
        console.log("error:");
        console.log("error: ", error);
        console.error("Error fetching exam data:", error);
        toast.error("Error fetching exam data: " + error);
      }
    }

    if (teacherId && examId) {
      getExamData();
    }
  }, [teacherId, examId]);
  const sortedScoresByDate = selectedStudent?.scores
    ?.slice() // avoid mutating original array
    .sort(
      (a, b) =>
        sortResultByDate
          ? new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime() // Oldest first
          : new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime() // Newest first
    );

  const handleSortResult = (sortByDate: boolean) => {
    setSortResultByDate((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigationBar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Results: {examData?.name}
            </h2>
            <Button
              variant="outline"
              onClick={() => handleSortResult(true)}
              className="text-md"
            >
              {sortResultByDate ? (
                <ArrowDownWideNarrow className="text-gray-500 text-lg" />
              ) : (
                <ArrowUpNarrowWide className="text-gray-500 text-lg" />
              )}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Latest Score</TableHead>
                  <TableHead>Last Submission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedResultData?.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {result.studentName}
                    </TableCell>
                    <TableCell>{result.studentEmail}</TableCell>
                    <TableCell>
                      {result.scores?.length > 0
                        ? result.scores[result.scores.length - 1].scored
                        : "No scores"}
                    </TableCell>
                    <TableCell>
                      {result.scores?.length > 0
                        ? format(
                            result.scores[result.scores.length - 1].submittedAt,
                            "MMM d, yyyy - h:mm a"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(result);
                          setShowDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialog for Student Details */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Student Details</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className=" w-full flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedStudent.studentName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.studentEmail}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="text-md duration-100 ease-in transition-all hover:bg-gray-200 hover:text-gray-800"
                    onClick={() => handleSortResult(true)}
                  >
                    {sortResultByDate ? (
                      <ArrowDownWideNarrow className="text-gray-500 text-lg" />
                    ) : (
                      <ArrowUpNarrowWide className="text-gray-500 text-lg" />
                    )}
                  </Button>
                </div>
              </div>
              {sortedScoresByDate?.map((score, index) => {
                const isExpanded = expandedScoreIndex === index;

                return (
                  <div key={index} className="border rounded-md p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedScoreIndex(
                          isExpanded ? null : index // collapse if clicked again
                        )
                      }
                    >
                      <div>
                        <p className="text-base font-medium text-gray-700">
                          Scored: {score.scored}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted at:{" "}
                          {format(score.submittedAt, "dd/MM/yyyy HH:mm:ss")}
                        </p>
                      </div>
                      <button className="text-blue-600 text-sm underline">
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm table-auto">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left">Question</th>
                              <th className="px-4 py-2 text-left">Selected</th>
                              <th className="px-4 py-2 text-left">Correct</th>
                            </tr>
                          </thead>
                          <tbody>
                            {score.responses.map((response, idx) => (
                              <tr
                                key={idx}
                                className={
                                  response.isCorrect
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                }
                              >
                                <td className="px-4 py-2 font-medium flex flex-col items-start gap-2">
                                  <p className="text-sm">
                                    {response.question}{" "}
                                  </p>
                                  {response.image && (
                                    <>
                                      {response.image && (
                                        <Image
                                          src={response.image}
                                          alt="Question Image"
                                          height={200}
                                          width={200}
                                          className="rounded-md w-28 h-20"
                                          unoptimized
                                        />
                                      )}
                                    </>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {/* Display selected options text */}
                                  {response.selectedOption
                                    .map((item) => item.content.text)
                                    .join(", ") || "Not Answered"}

                                  {/* Display images if there are any selected options */}
                                  {response.selectedOption.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {response.selectedOption.map(
                                        (item, i) => (
                                          <div
                                            key={i}
                                            className="flex flex-col items-center gap-2"
                                          >
                                            {item.content.image &&
                                              item.content.image.map(
                                                (img, index) => (
                                                  <div
                                                    key={index}
                                                    className="w-28 h-20 overflow-hidden rounded-lg shadow-md"
                                                  >
                                                    <Image
                                                      src={img}
                                                      alt={`Option Image ${i}-${index}`}
                                                      height={200}
                                                      width={200}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                )
                                              )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-2">
                                  {/* Display correct option IDs as a comma-separated list */}
                                  {response.correctOption
                                    .map((item) => item.content.text)
                                    .join(", ")}

                                  {/* Display images for correct options */}
                                  {response.correctOption.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {response.correctOption.map((item, i) => (
                                        <div
                                          key={i}
                                          className="flex flex-col items-center gap-2"
                                        >
                                          {item.content.image &&
                                            item.content.image.map(
                                              (img, index) => (
                                                <div
                                                  key={index}
                                                  className="w-28 h-20 overflow-hidden rounded-lg shadow-md"
                                                >
                                                  <Image
                                                    src={img}
                                                    alt={`Option Image ${i}-${index}`}
                                                    height={200}
                                                    width={200}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                              )
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
