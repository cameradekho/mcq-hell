"use client";

import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { IExam, IQuestion } from "@/models/exam";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTeacherById } from "../../../../../action/fetch-teacher-by-id";
import Image from "next/image";
import { addStudentResponse } from "../../../../../action/res/add-student-response";

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
  const [result, setResult] = useState<number>(0);
  const [teacherEmail, setTeacherEmail] = useState<string>();
  const [step, setStep] = useState<number>(0);

  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    studentName: "",
    studentEmail: "",
  });

  useEffect(() => {
    async function fetchExamData() {
      try {
        const data = await fetchExamById({
          teacherId: params.teacherId,
          examId: params.examId,
        });

        if (data.success) {
          setExam(data.data as IExam);

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

          toast.success("Exam fetched successfully!");
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

    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      if (!exam) return;

      // Check if all questions are answered
      const unansweredQuestions = exam.questions.filter(
        (q) => answers[q.id]?.length === 0
      );

      if (unansweredQuestions.length > 0) {
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
      } else {
        toast.error(result.message);
      }

      setSubmitted(true);
    } catch (error) {
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-slate-600">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {exam?.name || "Loading Exam..."}
          </CardTitle>
          <p className="text-muted-foreground">{exam?.description}</p>
        </CardHeader>
        {step === 0 && (
          <CardContent className="space-y-6">
            <span className="text-lg font-semibold">Student Details</span>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label
                  htmlFor="student-name"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Student Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  placeholder="Enter student name"
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={studentDetails.studentName}
                  onChange={(e) =>
                    setStudentDetails({
                      ...studentDetails,
                      studentName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="student-email"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Student Email
                </label>
                <input
                  id="student-email"
                  type="email"
                  placeholder="Enter student email"
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={studentDetails.studentEmail}
                  onChange={(e) =>
                    setStudentDetails({
                      ...studentDetails,
                      studentEmail: e.target.value,
                    })
                  }
                />
              </div>

              <Button
                type="button"
                onClick={handleFetchStudentData}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Proceed
              </Button>
            </div>
          </CardContent>
        )}

        {step === 1 && (
          <CardContent className="space-y-6">
            <span className="text-lg font-semibold">
              Hello, {studentDetails.studentName}
            </span>

            {!submitted &&
              exam?.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="mb-8 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <p className="font-semibold text-xl text-gray-800 mb-4">
                    {qIndex + 1}. {question.question}
                  </p>

                  {question.image && (
                    <div className="mb-4">
                      <Image
                        src={question.image}
                        alt="Question Image"
                        height={200}
                        width={200}
                        className="rounded-md w-72 h-64 object-cover mx-auto"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {question.answer.length > 1
                      ? question.options.map((option, j) => (
                          <label
                            key={j}
                            className={`block cursor-pointer p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${
                              answers[question.id]?.some(
                                (ans) => ans.id === option.id
                              )
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                name={`question-${qIndex}`}
                                value={option.id}
                                checked={
                                  answers[question.id]?.some(
                                    (ans) => ans.id === option.id
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleMultipleAnswerChange(
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
                                }
                                className="mt-1 accent-blue-500"
                              />

                              <div className="flex-1">
                                {option.textAnswer && (
                                  <span className="block text-lg text-gray-700">
                                    {option.textAnswer}
                                  </span>
                                )}
                                {option.image && (
                                  <div className="mt-2">
                                    <Image
                                      src={option.image}
                                      alt="Option Image"
                                      height={200}
                                      width={200}
                                      className="rounded-md w-72 h-64 object-cover mx-auto"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))
                      : question.options.map((option, j) => (
                          <label
                            key={j}
                            className={`block cursor-pointer p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${
                              answers[question.id]?.length > 0 &&
                              answers[question.id][0].id === option.id
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={option.id}
                                checked={
                                  answers[question.id]?.length > 0 &&
                                  answers[question.id][0]?.id === option.id
                                }
                                onChange={() =>
                                  handleSingleAnswerChange(question.id, {
                                    id: option.id,
                                    content: {
                                      text: option.textAnswer
                                        ? [option.textAnswer]
                                        : [],
                                      image: option.image ? [option.image] : [],
                                    },
                                  })
                                }
                                className="mt-1 accent-blue-500"
                              />

                              <div className="flex-1">
                                {option.textAnswer && (
                                  <span className="block text-lg text-gray-700">
                                    {option.textAnswer}
                                  </span>
                                )}
                                {option.image && (
                                  <div className="mt-2">
                                    <Image
                                      src={option.image}
                                      alt="Option Image"
                                      height={200}
                                      width={200}
                                      className="rounded-md w-72 h-64 object-cover mx-auto"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                  </div>
                </div>
              ))}

            {!submitted && (
              <Button className="w-full mt-6" onClick={handleSubmit}>
                Submit Exam
              </Button>
            )}

            {submitted && (
              <div className="overflow-x-auto mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Results: <span className="text-green-500">{result}</span> /{" "}
                  {exam?.questions.length}
                </h3>

                <table className="min-w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border px-4 py-2">#</th>
                      <th className="border px-4 py-2">Question</th>
                      <th className="border px-4 py-2">Your Answer</th>
                      <th className="border px-4 py-2">Correct Answer</th>
                      <th className="border px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam?.questions.map((question, index) => {
                      const selectedIds = answers[question.id] || [];
                      const isCorrect = arraysEqual(
                        selectedIds.map((item) => item.id).sort(),
                        question.answer.sort()
                      );

                      return (
                        <tr
                          key={index}
                          className={isCorrect ? "bg-green-100" : "bg-red-100"}
                        >
                          <td className="border px-4 py-2">{index + 1}</td>
                          <td className="border px-4 py-2">
                            {question.question}
                          </td>
                          <td className="border px-4 py-2">
                            {selectedIds.length > 0
                              ? selectedIds
                                  .map((id) =>
                                    getOptionTextById(question, id.id)
                                  )
                                  .join(", ")
                              : "Not Answered"}
                          </td>
                          <td className="border px-4 py-2">
                            {question.answer
                              .map((id) => getOptionTextById(question, id))
                              .join(", ")}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {isCorrect ? (
                              <span className="text-green-600 font-bold">
                                ✓ Correct
                              </span>
                            ) : (
                              <span className="text-red-600 font-bold">
                                ✗ Incorrect
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Page;
