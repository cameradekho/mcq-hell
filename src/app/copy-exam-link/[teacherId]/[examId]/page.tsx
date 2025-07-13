"use client";

import { useParams } from "next/navigation";
import { ExamSessionDate } from "./components/exam-session-date";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchSessionByExamId } from "@/action/fetch-session-by-examId";
import { useSession } from "next-auth/react";
import { ISession } from "@/models/exam";

export default function Home() {
  const { data: session } = useSession();
  const params = useParams();
  const teacherId = params.teacherId as string;
  const examId = params.examId as string;
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);
  const [existingSessionData, setExistingSessionData] = useState<ISession | undefined>(
    undefined
  );
    const [enableCopy, setEnableCopy] = useState(false);


  useEffect(() => {
    if (!session) {
      toast.error("Please sign in to access this page");
      return;
    }
  }, [session]);

  useEffect(() => {
    async function fetchSessionDate() {
      console.log("#$^$%^$%^&$%&$&$%^%^$%#^#$%^#!^%$%^$%^$%^&*U&%&%U%&%U$%^");
      try {
        const sessionData = await fetchSessionByExamId({
          examId: examId,
          teacherId: teacherId,
        });
        if (sessionData.success) {
          setExistingSessionData(sessionData?.data || undefined);
        } else {
          toast.error(sessionData.message || "Failed to fetch session date");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching session date");
      }
    }
    fetchSessionDate();
  }, [enableCopy]);

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
            }}
          />
        </div>
      </div>
    </div>
  );
}
