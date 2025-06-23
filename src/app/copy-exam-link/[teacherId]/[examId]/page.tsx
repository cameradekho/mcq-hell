"use client";

import { useParams } from "next/navigation";
import { ExamSessionDate } from "./components/exam-session-date";
import { useEffect, useState } from "react";

export default function Home() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const examId = params.examId as string;
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    
  },[])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 ">
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* App Title */}
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">
          Exam<span className=" text-secondary-foreground">Hell</span>
        </h1>

        {/* Session Date Card */}
        <div className="rounded-xl border border-muted bg-muted/40 shadow-sm p-6">
          <ExamSessionDate
            data={{
              exam: { id: examId },
              teacher: { _id: teacherId },
              sessionDate: sessionDate,
              setSessionDate: setSessionDate,
            }}
          />
        </div>
      </div>
    </div>
  );
}
