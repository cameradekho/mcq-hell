"use client";

import { useParams } from "next/navigation";
import { ExamSessionDate } from "./components/exam-session-date";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { IExam, IExamSession } from "@/models/exam";
import { Dayjs } from "dayjs";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchExamSessionByExamId } from "@/action/fetch-session-by-examId";

export default function Home() {
  const { data: session } = useSession();
  const params = useParams();
  const teacherId = params.teacherId as string;
  const examId = params.examId as string;
  const [sessionDate, setSessionDate] = useState<Dayjs | undefined>(undefined);
  const [existingSessionData, setExistingSessionData] = useState<
    IExamSession | undefined
  >(undefined);
  const [basicExamDetails, setBasicExamDetails] = useState<
    Pick<IExam, "name" | "description" | "duration" | "session">
  >({
    name: "",
    description: "",
    duration: 0,
  });
  const [enableCopy, setEnableCopy] = useState(false);

  useEffect(() => {
    if (!session) {
      toast.error("Please sign in to access this page");
      return;
    }
  }, [session]);

  useEffect(() => {
    async function fetchInitialExamandSessionData() {
      try {
        const [sessionData, examDetails] = await Promise.all([
          fetchExamSessionByExamId({ examId, teacherId }),
          fetchExamById({ examId, teacherId }),
        ]);

        if (!sessionData.success) {
          toast.error(sessionData.message);
        } else {
          setExistingSessionData(sessionData.data || undefined);
        }

        if (!examDetails.success) {
          toast.error(examDetails.message);
        } else {
          setBasicExamDetails({
            name: examDetails.data.name,
            description: examDetails.data.description,
            duration: examDetails.data.duration,
          });
        }
      } catch (error) {
        console.error("Error fetching initial data: ", error);
        toast.error("Error fetching initial data");
      }
    }

    fetchInitialExamandSessionData();
  }, []);

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
              existingSessionData: existingSessionData,
              enableCopy: enableCopy,
              setEnableCopy: setEnableCopy,
              basicExamDetails: basicExamDetails,
            }}
          />
        </div>
      </div>
    </div>
  );
}
