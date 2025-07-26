"use client";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { IExam, IQuestion } from "@/models/exam";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { addStudentResponse } from "@/action/res/add-student-response";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlarmClock, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { signOut, useSession } from "next-auth/react";
import { fetchStudentByEmail } from "@/action/student/fetch-student-by-email";
import { fetchExamSessionByExamId } from "@/action/fetch-session-by-examId";
import { IExamSession } from "@/models/teacher-exam-session";
import { Loading } from "./components/loading";
import { LoginForm } from "./components/login-form";
import {
  fetchStudentExamSessionByStudentId,
  IStudentExamSessionWithDetails,
} from "@/action/session/student/fetch-student-exam-session-by-studentId";
import { addStudentExamSession } from "@/action/session/student/add-student-exam-session";
import { addUser } from "@/action/add-user";
import { updateStudentExamSessionbyStudent } from "@/action/session/student/update-student-exam-session-by-student";
import { arraysEqual } from "./utils/array-equal";
import { formatTime } from "./utils/format-time";
import { IStudentExamSession } from "@/models/student-exam-session";
import { start } from "repl";

type PageProps = {
  params: {
    teacherId: string;
    examId: string;
  };
};
type StudentDetails = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
};

const Page = ({ params }: PageProps) => {
  const { data: session, status } = useSession();

  const [exam, setExam] = useState<IExam>();
  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        id: string;
        content: {
          text?: string[];
          image?: string[];
        };
      }[]
    >
  >({});

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [examduration, setExamDuration] = useState<number>(0);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    studentId: "",
    studentName: "",
    studentEmail: "",
    studentAvatar: "",
  });
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<IQuestion[]>([]);

  const [currentDate, setCurrentDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentTime, setCurrentTime] = useState<string>(
    format(new Date(), "HH:mm")
  );
  const [examSessionData, setExamSessionData] = useState<IExamSession | null>(
    null
  );
  const [isDateTimeMatched, setIsDateTimeMatched] = useState<boolean>(false);
  const [studentExamSession, setStudentExamSession] =
    useState<IStudentExamSessionWithDetails | null>(null);

  // validating the student account details, if not present in the DB then adding the students in the DB when `session` is available
  useEffect(() => {
    async function fetchStudentData() {
      console.log("ONEEEEEE");
      console.log("TWOEEEEE Email", session?.user?.email);
      const studentExists = await fetchStudentByEmail({
        studentEmail: session?.user?.email || "",
      });
      if (studentExists.success) {
        setStudentDetails((prev) => ({
          ...prev,
          studentId: studentExists.data._id.toString(),
          studentName: studentExists.data.name,
          studentEmail: studentExists.data.email,
          studentAvatar: studentExists.data.avatar,
        }));
      } else {
        const addStudentUser = await addUser({
          email: session?.user?.email || "",
          name: session?.user?.name || "",
          avatar: session?.user?.avatar || "",
          role: "student",
        });
        if (addStudentUser.success) {
          setStudentDetails((prev) => ({
            ...prev,
            studentId: addStudentUser.data?._id?.toString() || "",
            studentName: addStudentUser?.data?.name || "",
            studentEmail: addStudentUser?.data?.email || "",
            studentAvatar: addStudentUser?.data?.avatar || "",
          }));
        } else {
          toast.error(addStudentUser.message);
        }
      }
    }

    if (session && session?.user?.email && session?.user?.name) {
      fetchStudentData();
    }
  }, [session, session?.user?.email, session?.user?.name]);

  // setting the student-exam-session as not-started, when this page renders when only studentDetail is available
  useEffect(() => {
    async function validateExamSessionData() {
      try {
        console.log("pro starrrr spor one");

        const examSessionData = await fetchExamSessionByExamId({
          examId: params.examId,
          teacherId: params.teacherId,
        });

        if (!examSessionData.success) {
          toast.error(examSessionData.message);
          return;
        }

        setExamSessionData(examSessionData.data);

        console.log("kukur email", studentDetails.studentEmail);

        const studentSessionExists = await fetchStudentExamSessionByStudentId({
          studentId: studentDetails.studentId.toString() || "",
          examId: params.examId,
          teacherId: params.teacherId,
          examSessionId: examSessionData.data._id?.toString() || "",
        });

        if (studentSessionExists.success) {
          console.log("student_Session_Exists", studentSessionExists.data);
          const status = studentSessionExists.data.status;

          setStudentExamSession(studentSessionExists.data);

          if (status === "not-started") {
            toast.error("You have not started the exam");
          } else if (status === "started") {
            toast.error(
              "You have already started the exam in another Tab or Device"
            );
            setIsDateTimeMatched(false);
            setExamStarted(false);
            return;
          } else if (
            status === "completed" &&
            examSessionData.data._id === studentSessionExists.data.examSessionId
          ) {
            toast.error("You have already completed the exam");

            setIsDateTimeMatched(false);
            setExamStarted(false);
            return;
          } else if (status === "block") {
            toast.error("Your exam is blocked, please contact the teacher");
            setIsDateTimeMatched(false);
            setExamStarted(false);
            return;
          } else {
            const res = await addStudentExamSession({
              studentId: studentDetails.studentId.toString() || "",
              examId: params.examId,
              teacherId: params.teacherId,
              examSessionId: examSessionData.data._id?.toString() || "", // this is the exam session id
              status: "not-started",
            });

            if (res.success) {
              console.log("arijit four");
              setStudentExamSession(res?.data || null);
              console.log("studentExamSession ******>> ", res?.data);
              toast.success(res.message);
            } else {
              console.log("arijit five");
              toast.error(res.message);
              return;
            }
          }
        } else {
          console.log("#$%^&*#$%^&*#$^&. ====>>");
          const res = await addStudentExamSession({
            studentId: studentDetails.studentId.toString() || "",
            examId: params.examId,
            teacherId: params.teacherId,
            examSessionId: examSessionData.data._id?.toString() || "", // this is the exam session id
            status: "not-started",
          });

          if (res.success) {
            console.log("arijit four");
            setStudentExamSession(res?.data || null);
            console.log("studentExamSession ******>> ", res?.data);
            toast.success(res.message);
          } else {
            console.log("arijit five");
            toast.error(res.message);
            return;
          }
        }
      } catch (error) {
        console.error("Error adding exam session:", error);
        toast.error("Something went wrong while adding exam session");
      }
    }

    if (params.examId && params.teacherId && studentDetails.studentEmail) {
      validateExamSessionData();
    }
  }, [studentDetails.studentEmail]);

  //fetching the whole exam data when the studentDetails, examSessionData and studentExamSession Dats are available
  useEffect(() => {
    async function fetchExamData() {
      try {
        console.log("Startted fetching whole exam");
        const data = await fetchExamById({
          teacherId: params.teacherId,
          examId: params.examId,
        });

        if (data.success) {
          setExam(data.data as IExam);
          setExamDuration(data.data.duration);

          setAutoSubmit(false);

          // Initialize answers object with empty arrays for each question
          if (data.data) {
            const initialAnswers: Record<
              string,
              {
                id: string;
                content: {
                  text?: string[];
                  image?: string[];
                };
              }[]
            > = {};
            (data.data as IExam).questions.forEach((q) => {
              initialAnswers[q?._id?.toString()] = [];
            });
            setAnswers(initialAnswers);
          }
          console.log("Exam Name: ", data.data.name);
        } else {
          toast.error(data.message);
        }

        const date = new Date();
        setCurrentDate(format(date, "yyyy-MM-dd"));
        setCurrentTime(format(date, "hh:mm a"));

        console.log("examData fetching is done.");
      } catch (error: any) {
        toast.error("Error fetching exam");
        console.error(error);
      }
    }

    if (
      studentDetails.studentEmail &&
      studentExamSession?._id &&
      examSessionData?.examId
    ) {
      fetchExamData();
    }
  }, [studentExamSession, examSessionData]);

  // calcuing time left for the exam and auto-submit exam if time is over only when exam, examSessionData and studentDetails are available
  function startTimer() {
    console.log("ONË Starting the countdown timer for exam", exam?.duration);

    console.log("TWO Starting the countdown timer for exam");

    setTimeLeft(examduration * 60); // convert minutes to seconds

    const interval = setInterval(() => {
      console.log("interval", interval);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit(); // Auto-submit exam
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }

  function endTimer() {
    console.log("Ending the countdown timer for exam");
    setTimeLeft(0);
    setExamDuration(0);
    setAutoSubmit(false);
    setExamStarted(false);
  }

  useEffect(() => {
    if (exam?.questions) {
      const shuffled: IQuestion[] = [...exam.questions]
        .sort(() => Math.random() - 0.5) // shuffle questions
        .map((q) => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5), // shuffle options inside each question
        }));
      setShuffledQuestions(shuffled);
    }
  }, [exam]);

  const handleAutoSubmit = () => {
    if (!exam) return;
    setAutoSubmit(true);
    console.log("answers ", answers);
  };

  useEffect(() => {
    if (
      examSessionData?._id &&
      studentDetails.studentId &&
      exam?._id &&
      studentExamSession?._id
    ) {
      validateExamSessionDateAndTime();
    }
  }, [examSessionData, studentDetails, exam, studentExamSession]);

  // exam session date and time validation before starting the exam
  // This functionwill check if the current date and time matches the exam session date and time
  function validateExamSessionDateAndTime() {
    if (
      !examSessionData?.sessionDate ||
      !examSessionData.startTime ||
      !examSessionData?.endTime
    ) {
      console.log("Exam session details are not set....");
      console.log("examSessionData", examSessionData);
      console.log("examSessionData?.sessionDate", examSessionData?.sessionDate);
      console.log("examSessionData?.startTime", examSessionData?.startTime);
      return;
    }
    const now = new Date();
    const sessionDate = new Date(examSessionData?.sessionDate);
    const startTime = new Date(examSessionData.startTime);
    const endTime = new Date(examSessionData.endTime);

    const sameDate =
      now.getFullYear() === sessionDate.getFullYear() &&
      now.getMonth() === sessionDate.getMonth() &&
      now.getDate() === sessionDate.getDate();

    if (!sameDate) {
      toast.error("Sorry, Today is not the exam date");
      setExamStarted(false);
      setIsDateTimeMatched(false);
      return;
    } else if (now < startTime) {
      toast.error("Sorry, the exam hasn't started yet");
      setIsDateTimeMatched(false);
      setExamStarted(false);
    } else if (now > endTime) {
      toast.error("Sorry, the exam time is over");
      setIsDateTimeMatched(false);
      false;
      setExamStarted(false);
      return;
    } else {
      setIsDateTimeMatched(true);
      return;
    }
  }

  // Auto-submit exam if time is over
  // This will check every minute if the current time is within the exam session time range
  useEffect(() => {
    // Early return if conditions are not met
    if (!examStarted || !isDateTimeMatched) {
      return;
    }

    // Early return if required data is not available
    if (
      !studentExamSession?._id ||
      !examSessionData?.sessionDate ||
      !examSessionData?.startTime ||
      !examSessionData?.endTime
    ) {
      return;
    }

    // Early return if exam is already completed or blocked
    if (
      studentExamSession.status === "completed" ||
      studentExamSession.status === "block"
    ) {
      return;
    }

    const checkTimeValidity = () => {
      const now = new Date();
      const startTime = new Date(examSessionData.startTime?.toString() || "");
      const endTime = new Date(examSessionData.endTime?.toString() || "");

      const withinTimeRange = now >= startTime && now <= endTime;

      if (!withinTimeRange) {
        toast.error("Sorry, the exam time is over");
        setIsDateTimeMatched(false);
        setAutoSubmit(false);
        setExamStarted(false);
        setTimeLeft(0);
        setExamDuration(0);
      }
    };

    // Run initial check
    checkTimeValidity();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkTimeValidity, 60000);

    // Cleanup interval on unmount or dependency change
    return () => clearInterval(intervalId);
  }, [
    examStarted,
    isDateTimeMatched,
    studentExamSession,
    examSessionData?.sessionDate,
    examSessionData?.startTime,
    examSessionData?.endTime,
    studentExamSession?.status,
  ]);

  // Handle single choice (radio button) selection
  const handleSingleAnswerChange = (
    questionId: string,
    selectedOption: {
      id: string; // not optionId
      content: {
        text?: string[];
        image?: string[];
      };
    }
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [selectedOption],
    }));
  };

  // Handle multiple choice (checkbox) selection
  const handleMultipleAnswerChange = (
    questionId: string,
    selectedOption: {
      id: string;
      content: {
        text?: string[];
        image?: string[];
      };
    },
    isChecked: boolean
  ) => {
    setAnswers((prev) => {
      const currentSelections = prev[questionId];

      if (isChecked) {
        return {
          ...prev,
          [questionId]: [...currentSelections, selectedOption],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentSelections.filter(
            (opt) => opt.id !== selectedOption.id
          ),
        };
      }
    });
  };

  const handleFetchStudentData = async () => {
    // Validate student details
    console.log("studentDetails", studentDetails);
    if (!studentDetails.studentName.trim()) {
      toast.error("Please provide student name...");
      return;
    }

    if (session?.user?.email) {
      setStudentDetails((prev) => ({
        ...prev,
        studentEmail: session?.user.email,
      }));

      if (
        studentExamSession?.status === "completed" ||
        studentExamSession?.status === "block" ||
        studentExamSession?.status === "started"
      ) {
        setOpen(false);
        return;
      } else {
        setOpen(true);
      }
    } else {
      toast.error("Please Login again");
      return;
    }
  };

  const handleStartExam = async () => {
    try {
      setOpen(false); // close dialog
      setStep((prev) => prev + 1); // Move to step 2
      setExamStarted(true); // Start the exam

      console.log("hubba one");

      const updateStudentExamSession = await updateStudentExamSessionbyStudent({
        studentId: studentDetails.studentId,
        examId: params.examId.toString(),
        examSessionId: examSessionData?._id?.toString() || "",
        teacherId: params.teacherId.toString(),
        status: "started",
      });

      startTimer();

      if (!updateStudentExamSession) {
        toast.error("Student Exam Session not updated");
        setExamStarted(false);
        setIsDateTimeMatched(false);
        return;
      }

      toast.success(updateStudentExamSession.message);
    } catch (error) {
      console.error(error);
      toast.error("Error starting exam");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!exam) return;

      console.log("hubba one");
      // Check if all questions are answered
      const unansweredQuestions = exam.questions.filter(
        (q) => answers[q._id?.toString()]?.length === 0
      );

      if (timeLeft > 0 && unansweredQuestions.length > 0) {
        if (
          !confirm(
            `You have ${unansweredQuestions.length} unanswered questions. Do you want to submit anyway?`
          )
        ) {
          return;
        }
      }

      // Format responses for submission
      const formattedResponses = exam.questions.map((question) => {
        console.log("hubba one point five");
        const selectedOptions = answers[question._id?.toString()];
        console.log("selectedOptions");

        const isCorrect = arraysEqual(
          selectedOptions.map((item) => item.id.toString()).sort(),
          question.answer.map((id) => id?.toString()).sort()
        );

        return {
          questionId: question._id?.toString(),
          question: question.question,
          image: question.image || "",
          correctOption: question.options
            .filter((opt) => question.answer.includes(opt._id))
            .map((opt) => ({
              id: opt._id.toString(), // ✅ Corrected key
              content: {
                // ✅ Corrected key
                text: opt.textAnswer ? [opt.textAnswer] : [],
                image: opt.image ? [opt.image] : [],
              },
            })),
          selectedOption: selectedOptions.map((opt) => ({
            id: opt.id.toString(), // ✅ Corrected key
            content: {
              text: opt.content.text || [],
              image: opt.content.image || [],
            },
          })),
          isCorrect: isCorrect,
        };
      });
      console.log("hubba two");
      console.log(
        "CorrectOption Responses:",
        formattedResponses.map((item) =>
          item.correctOption.map((item1) => item1.content)
        )
      );
      console.log(
        "SelectedOption Responses:",
        formattedResponses.map((item) =>
          item.selectedOption.map((item1) => item1.content)
        )
      );
      // Calculate score
      const correctCount = formattedResponses.filter((r) => r.isCorrect).length;
      setResult(correctCount);

      endTimer();

      // Submit to server
      const result = await addStudentResponse({
        examId: params.examId,
        teacherId: params.teacherId,
        studentId: studentDetails.studentId.toString(),
        responses: formattedResponses,
        score: correctCount,
      });

      console.log("hubba three");

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        setSubmitting(false);
      }
      console.log("hubba five");

      const updateStudentExamSession = await updateStudentExamSessionbyStudent({
        studentId: studentDetails.studentId,
        examId: params.examId.toString(),
        examSessionId: examSessionData?._id?.toString() || "",
        teacherId: params.teacherId.toString(),
        status: "completed",
      });

      if (!updateStudentExamSession) {
        toast.error("Student Exam Session not updated");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitting(true);
      toast.error("Error submitting answers");
      console.error(error);
    }
  };

  useEffect(() => {
    if (autoSubmit) {
      handleSubmit();
      setAutoSubmit(false);
    }
  }, [autoSubmit]);

  // checking if session is present or not
  if (status === "loading") {
    <Loading />;
  }

  if (!session) {
    return <LoginForm teacherId={params.teacherId} examId={params.examId} />;
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-background">
        {session && (
          <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {exam?.name || "Loading Exam..."}
                </CardTitle>
                {exam?.description && (
                  <p className="text-muted-foreground mt-2">
                    {exam.description}
                  </p>
                )}
                {examStarted && timeLeft > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-primary">
                    <AlarmClock className="h-5 w-5" />
                    <span className="font-semibold">
                      Time Left: {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
              </CardHeader>

              {step === 0 && (
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Student Details</h2>
                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted text-center shadow-md">
                      <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted text-center shadow-md">
                        <div className="text-lg font-semibold text-primary">
                          Exam Session Details
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-accent-foreground">
                              Date:
                            </span>{" "}
                            {examSessionData?.sessionDate
                              ? new Date(
                                  examSessionData.sessionDate
                                ).toLocaleDateString()
                              : "Not set"}
                          </div>

                          <div>
                            <span className="font-medium text-accent-foreground">
                              Start Time:
                            </span>{" "}
                            {examSessionData?.startTime
                              ? new Date(
                                  examSessionData.startTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true, // this gives AM/PM format
                                })
                              : "Not set"}
                          </div>

                          <div>
                            <span className="font-medium text-accent-foreground">
                              End Time:
                            </span>{" "}
                            {examSessionData?.endTime
                              ? new Date(
                                  examSessionData.endTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true, // this gives AM/PM format
                                })
                              : "Not set"}
                          </div>

                          <div>
                            <span className="font-medium text-accent-foreground">
                              Exam Duration:
                            </span>{" "}
                            {exam?.duration} minutes
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <span className="font-medium text-accent-foreground">
                            CurrentDate: {currentDate}
                          </span>
                          <span className="font-medium text-accent-foreground">
                            CurrentTime: {currentTime}
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground ">
                      <span>
                        Your exam's session will be over in{" "}
                        {examSessionData?.endTime
                          ? new Date(
                              examSessionData.endTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true, // this gives AM/PM format
                            })
                          : "Not set"}{" "}
                        after that you can't submit your exam.
                      </span>
                    </div>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="student-name"
                          className="text-sm font-medium text-foreground"
                        >
                          Student Name
                        </label>
                        <input
                          id="student-name"
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={studentDetails.studentName}
                          onChange={(e) =>
                            setStudentDetails({
                              ...studentDetails,
                              studentName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="student-email"
                          className="text-sm font-medium text-foreground"
                        >
                          Student Email
                        </label>
                        <input
                          id="student-email"
                          type="email"
                          placeholder="Enter your email address"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={session.user.email}
                          readOnly={true}
                        />
                      </div>
                    </div>
                    <div className=" w-full flex items-center justify-between gap-2 text-primary">
                      <Button
                        className="w-full sm:w-auto "
                        size="lg"
                        variant="outline"
                        onClick={() =>
                          signOut({
                            callbackUrl: `/exam/${params.teacherId.toString()}/${
                              params.examId
                            }`,
                          })
                        }
                      >
                        Back
                      </Button>

                      {studentExamSession?.status === "completed" ||
                      studentExamSession?.status === "block" ||
                      studentExamSession?.status === "started" ? (
                        <></>
                      ) : (
                        <Button
                          onClick={handleFetchStudentData}
                          className="w-full sm:w-auto"
                          size="lg"
                          disabled={isDateTimeMatched === false}
                        >
                          Proceed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}

              {step === 1 && (
                <>
                  <CardContent className="space-y-8">
                    {examStarted && (
                      <div className="rounded-lg bg-primary/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Hello, {studentDetails.studentName}
                          </span>
                        </div>
                        {!examStarted && (
                          <div className="flex items-center gap-2 text-primary">
                            <AlarmClock className="h-5 w-5" />
                            <span className="font-semibold">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!submitted &&
                      exam?.questions &&
                      shuffledQuestions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="rounded-lg border bg-card p-6 shadow-sm transition-colors"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                {qIndex + 1}
                              </span>
                              <h3 className="text-lg font-medium leading-none pt-1">
                                {question.question}
                              </h3>
                            </div>

                            {question.image && (
                              <div className="mt-4">
                                <Image
                                  src={question.image}
                                  alt="Question Image"
                                  width={400}
                                  height={300}
                                  className="rounded-lg object-cover mx-auto"
                                />
                              </div>
                            )}

                            <div className="space-y-3 pt-4">
                              {question.options.map((option, j) => (
                                <label
                                  key={j}
                                  className={cn(
                                    "block cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent/5 transition-colors",
                                    (question.answer.length > 1
                                      ? answers[question._id.toString()]?.some(
                                          (ans) =>
                                            ans.id === option._id.toString()
                                        )
                                      : answers[question?._id?.toString()]?.[0]
                                          ?.id === option?._id?.toString()) &&
                                      "ring-2 ring-primary"
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type={
                                        question.answer.length > 1
                                          ? "checkbox"
                                          : "radio"
                                      }
                                      name={`question-${qIndex}`}
                                      value={option._id?.toString()}
                                      checked={
                                        question.answer.length > 1
                                          ? answers[
                                              question._id.toString()
                                            ]?.some(
                                              (ans) =>
                                                ans.id ===
                                                option._id?.toString()
                                            )
                                          : answers[
                                              question._id?.toString()
                                            ]?.[0]?.id ===
                                            option._id?.toString()
                                      }
                                      onChange={(e) =>
                                        question.answer.length > 1
                                          ? handleMultipleAnswerChange(
                                              question._id.toString(),
                                              {
                                                id: option._id.toString(),
                                                content: {
                                                  text: option.textAnswer
                                                    ? [option.textAnswer]
                                                    : [],
                                                  image: option.image
                                                    ? [option.image]
                                                    : [],
                                                },
                                              },
                                              e.target.checked
                                            )
                                          : handleSingleAnswerChange(
                                              question._id.toString(),
                                              {
                                                id: option._id.toString(),
                                                content: {
                                                  text: option.textAnswer
                                                    ? [option.textAnswer]
                                                    : [],
                                                  image: option.image
                                                    ? [option.image]
                                                    : [],
                                                },
                                              }
                                            )
                                      }
                                      className="mt-1"
                                    />
                                    <div className="flex-1 space-y-3">
                                      {option.textAnswer && (
                                        <span className="text-sm">
                                          {option.textAnswer}
                                        </span>
                                      )}
                                      {option.image && (
                                        <Image
                                          src={option.image}
                                          alt="Option Image"
                                          width={300}
                                          height={200}
                                          className="rounded-lg object-cover"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    {!submitted && (
                      <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={submitting || isDateTimeMatched === false}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Exam"
                        )}
                      </Button>
                    )}

                    {submitted && (
                      <div className="space-y-6">
                        <div className="rounded-lg bg-card p-6 shadow-sm">
                          <h3 className="text-xl font-semibold mb-4">
                            Exam Results..
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="text-4xl font-bold text-primary">
                              {result}
                              <span className="text-muted-foreground text-lg">
                                /{exam?.questions.length}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Questions Answered Correctly
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Your Answer</TableHead>
                                <TableHead>Correct Answer</TableHead>
                                <TableHead className="w-[100px]">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {exam?.questions.map((question, index) => {
                                const selectedIds =
                                  answers[question._id?.toString()] || [];
                                const isCorrect = arraysEqual(
                                  selectedIds.map((item) => item.id).sort(),
                                  question.answer
                                    .map((id) => id.toString())
                                    .sort()
                                );

                                return (
                                  <TableRow
                                    key={index}
                                    className={cn(
                                      isCorrect ? "bg-green-50" : "bg-red-50"
                                    )}
                                  >
                                    {/* Question Number */}
                                    <TableCell className="font-medium">
                                      {index + 1}
                                    </TableCell>

                                    {/* Question Text + Optional Image */}
                                    <TableCell>
                                      <div className="flex flex-col items-start gap-2">
                                        <span>{question.question}</span>
                                        {question.image && (
                                          <Image
                                            src={question.image}
                                            alt="question"
                                            width={200}
                                            height={200}
                                            className="w-32 h-auto rounded-lg"
                                          />
                                        )}
                                      </div>
                                    </TableCell>

                                    {/* Your Answer */}
                                    <TableCell>
                                      <div className="flex flex-wrap items-center gap-4">
                                        {selectedIds.length > 0 ? (
                                          selectedIds.map(({ id }) => {
                                            const option =
                                              question.options.find(
                                                (opt) =>
                                                  opt._id.toString() === id
                                              );

                                            if (!option)
                                              return (
                                                <span key={id}>Not found</span>
                                              );

                                            return (
                                              <div
                                                key={id}
                                                className="flex items-center gap-2"
                                              >
                                                {option.image && (
                                                  <img
                                                    src={option.image}
                                                    alt="Option"
                                                    className="h-12 w-12 object-cover rounded"
                                                  />
                                                )}
                                                {option.textAnswer && (
                                                  <span>
                                                    {option.textAnswer}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })
                                        ) : (
                                          <span>Not Answered</span>
                                        )}
                                      </div>
                                    </TableCell>

                                    {/* Correct Answer */}
                                    <TableCell>
                                      <div className="flex flex-wrap items-center gap-4">
                                        {question.answer.map((id) => {
                                          const option = question.options.find(
                                            (opt) =>
                                              opt._id?.toString() ===
                                              id?.toString()
                                          );
                                          if (!option)
                                            return (
                                              <span key={id?.toString()}>
                                                Not found
                                              </span>
                                            );

                                          return (
                                            <div
                                              key={id?.toString()}
                                              className="flex items-center gap-2"
                                            >
                                              {option.image && (
                                                <Image
                                                  src={option.image}
                                                  alt="Option"
                                                  height={48}
                                                  width={48}
                                                  className="h-12 w-12 object-cover rounded"
                                                />
                                              )}
                                              {option.textAnswer && (
                                                <span>{option.textAnswer}</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </TableCell>

                                    {/* Result */}
                                    <TableCell>
                                      {isCorrect ? (
                                        <span className="inline-flex items-center gap-1 text-green-600">
                                          <CheckCircle className="h-4 w-4" />
                                          <span>Correct</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-red-600">
                                          <span className="text-xl leading-none">
                                            ✗
                                          </span>
                                          <span>Incorrect</span>
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>

            <Dialog open={open} onOpenChange={setOpen} modal={true}>
              <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Confirm Student Details</DialogTitle>
                  <DialogDescription>
                    Please verify your information before proceeding to the
                    exam.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex  gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Name:
                    </span>
                    <span className="font-medium">
                      {studentDetails.studentName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Email:
                    </span>
                    <span className="font-medium">
                      {studentDetails.studentEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlarmClock className="h-5 w-5" />
                    <span>Duration: {exam?.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5" />
                    <span>Questions: {exam?.questions?.length || 0}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Edit Details
                  </Button>
                  <Button onClick={handleStartExam}>
                    Confirm & Start Exam
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    );
  }
};

export default Page;
