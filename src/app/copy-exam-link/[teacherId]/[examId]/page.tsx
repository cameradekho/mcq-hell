"use client";

import { useParams, useRouter } from "next/navigation";
import { ExamSessionDate } from "./components/exam-session-date";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { IExam } from "@/models/exam";
import { Dayjs } from "dayjs";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { fetchExamSessionByExamId } from "@/action/fetch-session-by-examId";
import { IExamSession } from "@/models/teacher-exam-session";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;
  const examId = params.examId as string;
  const [sessionDate, setSessionDate] = useState<Dayjs | undefined>(undefined);
  const [existingSessionData, setExistingSessionData] = useState<
    IExamSession | undefined
  >(undefined);
  const [basicExamDetails, setBasicExamDetails] = useState<
    Pick<IExam, "name" | "description" | "duration">
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
        const teacherData = await fetchTeacherById({
          teacherId: teacherId,
        });

        if (!teacherData.success) {
          toast.error(teacherData.message);
          return;
        }

        console.log("user email", session?.user.email);
        console.log("teacher email", teacherData.data.email);

        console.log("User Name", session?.user.name);
        console.log("Teacher Name", teacherData.data.name);

        if (
          teacherData.data.email !== session?.user.email ||
          teacherData.data.name !== session.user.name
        ) {
          toast.error("You cannot access this page");
          router.push("/");
          return;
        }

        console.log("teacherId", teacherId);
        console.log("examId", examId);

        const [sessionData, examDetails] = await Promise.all([
          fetchExamSessionByExamId({ examId, teacherId }),
          fetchExamById({ examId, teacherId }),
        ]);

        console.log("sessionData", sessionData);
        console.log("examDetails", examDetails);

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
    if (examId && teacherId && session?.user.name && session.user.email) {
      fetchInitialExamandSessionData();
    }
  }, [session?.user.name, session?.user.email, examId, teacherId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-24 bg-background px-4  ">
      <TopNavigationBar />
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* App Title */}
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">
          Exam<span className=" text-secondary-foreground">Hell</span>
        </h1>

        {/* Session Date Card */}
        <div className="rounded-xl border border-muted bg-muted/40 shadow-sm p-6">
          <ExamSessionDate
            data={{
              exam: { _id: examId },
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
