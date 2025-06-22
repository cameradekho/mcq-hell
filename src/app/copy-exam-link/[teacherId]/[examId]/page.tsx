"use client";

import { useParams } from "next/navigation";
import { ExamSessionDate } from "./components/exam-session-date";
import { useState } from "react";

export default function Home() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const examId = params.examId as string;
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);

  const handleCopyExamLink = ({
    examId,
    teacherId,
  }: {
    examId: string;
    teacherId: string;
  }) => {};

  return (
    <div className="flex items-center justify-center h-screen flex-col gap-2">
      <h1 className="text-2xl font-bold">ExamHell</h1>
      <ExamSessionDate
        data={{
          exam: { id: examId },
          teacher: { _id: teacherId },
          handleCopyExamLink: handleCopyExamLink,
          sessionDate: sessionDate,
          setSessionDate: setSessionDate,
        }}
      />
    </div>
  );
}
