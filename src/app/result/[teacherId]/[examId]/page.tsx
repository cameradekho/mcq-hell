"use client";
import { IExam } from "@/models/exam";
import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { useParams } from "next/navigation";
import {
  ExamResultWithStudentInfo,
  fetchResultByTeacherIdExamId,
  IScores,
} from "../../../../../action/res/fetch-result-by-teacherId-examId";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedScoreIndex, setSelectedScoreIndex] = useState<number>(0);
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
          console.log("Formatted Results:", formattedRes);
        } else {
          console.log("error: ", studentsResponseDatas.message);
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Results: {examData?.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {formattedResultData?.map((result, index) => (
          <Card
            key={index}
            onClick={() => {
              setSelectedStudent(result);
              setShowDialog(true);
            }}
            className="cursor-pointer shadow-md transition-transform duration-200 hover:scale-[1.02] border border-gray-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold text-gray-900">
                  {result.studentName}
                </div>
                <div className="text-sm text-gray-500">
                  {result.studentEmail}
                </div>
                {result.scores?.length > 0 ? (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Scored:</span>{" "}
                      {result.scores[result.scores.length - 1].scored}
                    </p>
                    <p>
                      <span className="font-medium">Submitted at:</span>{" "}
                      {format(
                        result.scores[result.scores.length - 1].submittedAt,
                        "dd/MM/yyyy HH:mm:ss"
                      )}
                    </p>
                  </div>
                ) : (
                  <span className="text-red-500 text-sm">No scores found</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                                <td className="px-4 py-2 font-medium">
                                  {response.question}
                                </td>
                                <td className="px-4 py-2">
                                  {response.selectedOption}
                                </td>
                                <td className="px-4 py-2">
                                  {response.correctOption}
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
