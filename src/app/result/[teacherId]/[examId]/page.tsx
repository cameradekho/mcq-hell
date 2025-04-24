"use client";
import { IExam } from "@/models/exam";
import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { useParams } from "next/navigation";
import {
  ExamResultWithStudentInfo,
  fetchResultByTeacherIdExamId,
} from "../../../../../action/res/fetch-result-by-teacherId-examId";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const Page = () => {
  const { teacherId, examId } = useParams() as {
    teacherId: string;
    examId: string;
  };
  const [examData, setExamData] = useState<IExam>();
  const [resultData, setResultData] = useState<ExamResultWithStudentInfo[]>();
  const [selectedStudent, setSelectedStudent] =
    useState<ExamResultWithStudentInfo | null>(null);
  const [selectedScoreIndex, setSelectedScoreIndex] = useState<number>(0);
  const [showDialog, setShowDialog] = useState(false);

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
        if (studentsResponseDatas.success) {
          setResultData(studentsResponseDatas.data);
          console.log("result data: ", studentsResponseDatas.data);
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{examData?.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {resultData &&
          resultData?.map((result) => {
            const latestScore = result.scores?.length
              ? result.scores[result.scores.length - 1]
              : null;
            return (
              <Card
                key={result.studentEmail}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedStudent(result);
                  setSelectedScoreIndex(result?.scores?.length - 1);
                  setShowDialog(true);
                }}
              >
                <CardContent className="p-4">
                  <p className="font-semibold">{result.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.studentEmail}
                  </p>
                  {latestScore ? (
                    <>
                      <p className="text-sm">Score: {latestScore.scored}</p>
                      <p className="text-sm">
                        Date:{" "}
                        {latestScore.submittedAt
                          ? format(
                              new Date(latestScore.submittedAt),
                              "dd MMM yyyy HH:mm"
                            )
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No attempts yet
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.studentName}'s Attempts</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 overflow-x-auto py-4">
            {selectedStudent &&
              selectedStudent?.scores.map((score, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                  onClick={() => setSelectedScoreIndex(index)}
                >
                  <div
                    className={`w-6 h-6 rounded-full cursor-pointer ${
                      index === selectedScoreIndex
                        ? "bg-blue-600"
                        : "bg-blue-400"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {score.submittedAt
                      ? format(new Date(score.submittedAt), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              ))}
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Question</th>
                  <th className="p-2 border">Correct Option</th>
                  <th className="p-2 border">Selected Option</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent?.scores[selectedScoreIndex]?.responses.map(
                  (response, index) => (
                    <tr
                      key={index}
                      className={
                        response.correctOption === response.selectedOption
                          ? "bg-green-100"
                          : "bg-red-100"
                      }
                    >
                      <td className="p-2 border">{response.question}</td>
                      <td className="p-2 border">{response.correctOption}</td>
                      <td className="p-2 border">{response.selectedOption}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Page;
