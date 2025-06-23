"use client";
import { format } from "date-fns";
import React, { use, useEffect, useState } from "react";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { IAnswer, IExam, IQuestion } from "@/models/exam";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTeacherById } from "@/action/fetch-teacher-by-id";
import Image from "next/image";
import { addStudentResponse } from "@/action/res/add-student-response";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
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
import StudentExamAuthButton from "@/components/auth/student-exam-auth-button";

type PageProps = {
  params: {
    teacherId: string;
    examId: string;
  };
};
type StudentDetails = {
  studentName: string;
  studentEmail: string;
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
  const [teacherEmail, setTeacherEmail] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    studentName: "",
    studentEmail: "",
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

  const [isDateTimeMatched, setIsDateTimeMatched] = useState<boolean>(false);

  useEffect(() => {
    async function fetchExamData() {
      try {
        const data = await fetchExamById({
          teacherId: params.teacherId,
          examId: params.examId,
        });

        if (data.success) {
          setExam(data.data as IExam);
          setDuration(data.data.duration);

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
              initialAnswers[q.id] = [];
            });
            setAnswers(initialAnswers);
          }
        } else {
          toast.error(data.message);
        }

        const teacherData = await fetchTeacherById({
          teacherId: params.teacherId,
        });

        if (teacherData.success) {
          setTeacherEmail(teacherData.data.email);
        }

        const date = new Date();
        setCurrentDate(format(date, "yyyy-MM-dd"));
        setCurrentTime(format(date, "hh:mm a"));
      } catch (error: any) {
        toast.error("Error fetching exam");
        console.error(error);
      }
    }

    fetchExamData();
  }, [params.teacherId, params.examId, isDateTimeMatched === true]);

  useEffect(() => {
    if (!examStarted || !exam || exam.duration === 0) return;

    setTimeLeft(exam.duration * 60); // convert minutes to seconds

    const interval = setInterval(() => {
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
  }, [examStarted, exam]);

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
    // Submit exam
    handleSubmit();
  };

  // exam session date and time validation before starting the exam
  // This will check if the current date and time matches the exam session date and time
  useEffect(() => {
    if (
      !exam?.session?.sessionDate ||
      !exam?.session?.startTime ||
      !exam?.session?.endTime
    ) {
      console.log("Exam session details are not set");
      return;
    }
    const now = new Date();
    const sessionDate = new Date(exam?.session?.sessionDate);
    const startTime = new Date(exam.session.startTime);
    const endTime = new Date(exam.session.endTime);

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
  }, [exam]);

  // Auto-submit exam if time is over
  // This will check every minute if the current time is within the exam session time range
  useEffect(() => {
    const setIntervalId = setInterval(() => {
      if (
        !exam?.session?.sessionDate ||
        !exam?.session?.startTime ||
        !exam?.session?.endTime
      ) {
        console.log("Exam session details are not set");
        return;
      }
      const now = new Date();
      const startTime = new Date(exam.session.startTime);
      const endTime = new Date(exam.session.endTime);

      const withinTimeRange = now >= startTime && now <= endTime;

      if (!withinTimeRange) {
        toast.error("Sorry, the exam time is over");
        //handleAutoSubmit();
        setIsDateTimeMatched(false);
        setAutoSubmit(false);
        setExamStarted(false);
        setTimeLeft(0);
        setDuration(0);
      }
    }, 60000);

    return () => clearInterval(setIntervalId); // Cleanup interval on unmount
  }, [exam, isDateTimeMatched === true, examStarted === true]);

  useEffect(() => {
    if (session?.user?.name) {
      setStudentDetails((prev) => ({
        ...prev,
        studentName: session.user.name,
      }));
    }

    if (session?.user?.email) {
      setStudentDetails((prev) => ({
        ...prev,
        studentEmail: session.user.email,
      }));
    }
  }, [session?.user.name, session?.user.email]);

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
    if (!studentDetails.studentName.trim()) {
      toast.error("Please provide student name");
      return;
    }

    if (session?.user?.email) {
      setStudentDetails((prev) => ({
        ...prev,
        studentEmail: session?.user.email,
      }));
    } else {
      toast.error("Please Login again");
      return;
    }

    setOpen(true);
  };

  const handleStartExam = () => {
    setOpen(false); // close dialog
    setStep((prev) => prev + 1); // Move to step 2
    setExamStarted(true); // Start the exam
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!exam) return;

      console.log("hubba one");
      // Check if all questions are answered
      const unansweredQuestions = exam.questions.filter(
        (q) => answers[q.id]?.length === 0
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
        const selectedOptions = answers[question.id];
        console.log("selectedOptions");

        const isCorrect = arraysEqual(
          selectedOptions.map((item) => item.id).sort(),
          question.answer.sort()
        );

        return {
          questionId: question.id,
          question: question.question,
          image: question.image || "",
          correctOption: question.options
            .filter((opt) => question.answer.includes(opt.id))
            .map((opt) => ({
              id: opt.id, // ✅ Corrected key
              content: {
                // ✅ Corrected key
                text: opt.textAnswer ? [opt.textAnswer] : [],
                image: opt.image ? [opt.image] : [],
              },
            })),
          selectedOption: selectedOptions.map((opt) => ({
            id: opt.id, // ✅ Corrected key
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

      // Submit to server
      const result = await addStudentResponse({
        teacherId: params.teacherId,
        teacherEmail: teacherEmail || "",
        studentName: studentDetails.studentName,
        studentEmail: studentDetails.studentEmail,
        studentAvatar: "",
        examId: params.examId,
        response: formattedResponses,
        score: {
          scored: correctCount,
          submittedAt: new Date(),
        },
      });

      console.log("hubba three");

      if (result.success) {
        toast.success(result.message);
        setAutoSubmit(false);
        setExamStarted(false);
        setTimeLeft(0);
        setDuration(0);
      } else {
        toast.error(result.message);
        setSubmitting(false);
      }
      console.log("hubba five");
      setSubmitted(true);
    } catch (error) {
      setSubmitting(true);
      toast.error("Error submitting answers");
      console.error(error);
    }
  };

  // Helper function to compare arrays
  function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // checking if session is present or not
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-sm text-muted-foreground">
            Checking your session....
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Student Exam Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            You must be signed in to access the exam. Click the button below to
            sign in with your student account.
          </p>
          <StudentExamAuthButton
            props={{
              teacherId: params.teacherId,
              examId: params.examId,
            }}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Your email will be used to identify your submission.
          </p>
        </div>
      </div>
    );
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
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
              </CardHeader>

              {step === 0 && (
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Student Details</h2>
                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted text-center shadow-md">
                      <div className="text-lg font-semibold text-primary">
                        Exam Session Details
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted text-center shadow-md">
                        <div className="text-lg font-semibold text-primary">
                          Exam Session Details
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-accent-foreground">
                              Date:
                            </span>{" "}
                            {exam?.session?.sessionDate
                              ? new Date(
                                  exam.session.sessionDate
                                ).toLocaleDateString()
                              : "Not set"}
                          </div>

                          <div>
                            <span className="font-medium text-accent-foreground">
                              Start Time:
                            </span>{" "}
                            {exam?.session?.startTime
                              ? new Date(
                                  exam.session.startTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true, // this gives AM/PM format
                                })
                              : "Not set"}
                          </div>

                          <div>
                            <span className="font-medium text-accent-foreground">
                              Start Time:
                            </span>{" "}
                            {exam?.session?.endTime
                              ? new Date(
                                  exam.session.endTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true, // this gives AM/PM format
                                })
                              : "Not set"}
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
                        {exam?.session?.endTime
                          ? new Date(exam.session.endTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // this gives AM/PM format
                              }
                            )
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

                      <Button
                        onClick={handleFetchStudentData}
                        className="w-full sm:w-auto"
                        size="lg"
                        disabled={isDateTimeMatched === false}
                      >
                        Proceed
                      </Button>
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
                                      ? answers[question.id]?.some(
                                          (ans) => ans.id === option.id
                                        )
                                      : answers[question.id]?.[0]?.id ===
                                        option.id) && "ring-2 ring-primary"
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
                                      value={option.id}
                                      checked={
                                        question.answer.length > 1
                                          ? answers[question.id]?.some(
                                              (ans) => ans.id === option.id
                                            )
                                          : answers[question.id]?.[0]?.id ===
                                            option.id
                                      }
                                      onChange={(e) =>
                                        question.answer.length > 1
                                          ? handleMultipleAnswerChange(
                                              question.id,
                                              {
                                                id: option.id,
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
                                              question.id,
                                              {
                                                id: option.id,
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
                                const selectedIds = answers[question.id] || [];
                                const isCorrect = arraysEqual(
                                  selectedIds.map((item) => item.id).sort(),
                                  question.answer.sort()
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
                                                (opt) => opt.id === id
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
                                                    {option.textAnswer} yooo
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
                                        {question.answer.map((id: string) => {
                                          const option = question.options.find(
                                            (opt) => opt.id === id
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
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Name:
                    </span>
                    <span className="font-medium">
                      {studentDetails.studentName}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
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
