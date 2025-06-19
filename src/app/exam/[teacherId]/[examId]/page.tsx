"use client";

import React, { useEffect, useState } from "react";
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
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<number>(0);
  const [teacherEmail, setTeacherEmail] = useState<string>();
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
  const [shuffledAnswers, setShuffledAnswers] = useState<IAnswer[]>([]);

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

        const fetchTeacherEmail = await fetchTeacherById({
          teacherId: params.teacherId,
        });

        if (fetchTeacherEmail.success) {
          setTeacherEmail(fetchTeacherEmail.data.email || "");
        }
      } catch (error: any) {
        toast.error("Error fetching exam");
        console.error(error);
      }
    }

    fetchExamData();
  }, [params.teacherId, params.examId]);

  useEffect(() => {
    if (!examStarted || !exam || exam.duration === 0) return;

    // Initialize timeLeft when exam starts
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

    // Submit exam
    handleSubmit();
  };

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
      const currentSelections = prev[questionId] || [];

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
    if (
      !studentDetails.studentName.trim() ||
      !studentDetails.studentEmail.trim()
    ) {
      toast.error("Please provide both student name and email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentDetails.studentEmail)) {
      toast.error("Please provide a valid email address");
      return;
    }

    setOpen(true); // Show confirmation dialog
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
        const selectedOptions = answers[question.id] || [];

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

      if (result.success) {
        toast.success(result.message);
        setAutoSubmit(false);
        setExamStarted(false);
        setTimeLeft(0);
        setDuration(0)
      } else {
        toast.error(result.message);
        setSubmitting(false)
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitting(true)
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

  function getOptionTextById(question: IQuestion, optionId: string) {
    const option = question.options.find((opt) => opt.id === optionId);
    return option ? option.textAnswer || "Image option" : "Not found";
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {exam?.name || "Loading Exam..."}
            </CardTitle>
            {exam?.description && (
              <p className="text-muted-foreground mt-2">{exam.description}</p>
            )}
            {examStarted && timeLeft > 0 && (
              <div className="mt-4 flex items-center gap-2 text-primary">
                <AlarmClock className="h-5 w-5" />
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </CardHeader>

          {step === 0 && (
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Student Details</h2>
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
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={studentDetails.studentEmail}
                      onChange={(e) =>
                        setStudentDetails({
                          ...studentDetails,
                          studentEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleFetchStudentData}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Proceed
                </Button>
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
                    {
                      !examStarted &&
                    (<div className="flex items-center gap-2 text-primary">
                      <AlarmClock className="h-5 w-5" />
                      <span className="font-semibold">
                        {formatTime(timeLeft)}
                      </span>
                    </div>)
                    }
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
                                      : handleSingleAnswerChange(question.id, {
                                          id: option.id,
                                          content: {
                                            text: option.textAnswer
                                              ? [option.textAnswer]
                                              : [],
                                            image: option.image
                                              ? [option.image]
                                              : [],
                                          },
                                        })
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
                  disabled={submitting}
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
                            <TableHead className="w-[100px]">Status</TableHead>
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
  className={cn(isCorrect ? "bg-green-50" : "bg-red-50")}
>
  {/* Question Number */}
  <TableCell className="font-medium">{index + 1}</TableCell>

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
          const option = question.options.find((opt) => opt.id === id);
          if (!option) return <span key={id}>Not found</span>;

          return (
            <div key={id} className="flex items-center gap-2">
              {option.image && (
                <img
                  src={option.image}
                  alt="Option"
                  className="h-12 w-12 object-cover rounded"
                />
              )}
              {option.textAnswer && <span>{option.textAnswer}</span>}
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
        const option = question.options.find((opt) => opt.id === id);
        if (!option) return <span key={id}>Not found</span>;

        return (
          <div key={id} className="flex items-center gap-2">
            {option.image && (
              <Image
                src={option.image}
                alt="Option"
                height={48}
                width={48}
                className="h-12 w-12 object-cover rounded"
              />
            )}
            {option.textAnswer && <span>{option.textAnswer}</span>}
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
        <span className="text-xl leading-none">✗</span>
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
                Please verify your information before proceeding to the exam.
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
              <Button onClick={handleStartExam}>Confirm & Start Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
