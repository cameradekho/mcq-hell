"use client";

import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { IExam } from "@/models/exam";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addStudentResponse } from "../../../../../action/res/add-student-response";
import { fetchTeacherById } from "../../../../../action/fetch-teacher-by-id";

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
          setExam(data.data);
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

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleFetchStudentData = async () => {
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      console.log("Selected Answers:");
      exam?.questions.forEach((question) => {
        console.log("Question id", question.id);
        console.log(`Q: ${question.question}`);
        console.log(`Selected: ${answers[question.id] || "Not Answered"}`);
        console.log(`Correct: ${question.answer}`);
        console.log("------");
      });
      const formattedResponses =
        exam?.questions.map((question) => ({
          questionId: question.id,
          question: question.question,
          correctOption: question.answer,
          selectedOption: answers[question.id] || "",
          isCorrect: question.answer === answers[question.id],
        })) || [];

      const correctCount =
        exam?.questions.reduce((count, question) => {
          return question.answer === answers[question.id] ? count + 1 : count;
        }, 0) || 0;

      setResult(correctCount);
      console.log("one");
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
      console.log("two");
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSubmitted(true);
    } catch (error) {
      toast.error("Error submitting answers");
    }
  };

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
            <span>Hello, {studentDetails.studentName}</span>
            {!submitted &&
              exam?.questions.map((question, qIndex) => (
                <div key={qIndex} className="mb-6">
                  <p className="font-semibold mb-2">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-1">
                    {question.options.map((option, j) => (
                      <label key={j} className="block cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={option}
                          onChange={() =>
                            handleAnswerChange(question.id, option)
                          }
                          className="mr-2"
                        />
                        {option}
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
                  Results: <span className=" text-green-500">{result}</span> /{" "}
                  {exam?.questions.length}
                </h3>

                <table className="min-w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border px-4 py-2">#</th>
                      <th className="border px-4 py-2">Question</th>
                      <th className="border px-4 py-2">Chosen Option</th>
                      <th className="border px-4 py-2">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam?.questions.map((question, index) => {
                      const selected = answers[question.id];
                      const isCorrect = selected === question.answer;
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
                            {selected || "Not Answered"}
                          </td>
                          <td className="border px-4 py-2">
                            {question.answer}
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
