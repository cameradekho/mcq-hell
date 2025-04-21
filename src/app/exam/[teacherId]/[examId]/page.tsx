"use client";

import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { IExam } from "@/models/exam";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: {
    teacherId: string;
    examId: string;
  };
};

const Page = ({ params }: PageProps) => {
  const [exam, setExam] = useState<IExam>();
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    console.log("Selected Answers:");
    exam?.questions.forEach((question) => {
      console.log(`Q: ${question.question}`);
      console.log(`Selected: ${answers[question.id] || "Not Answered"}`);
      console.log(`Correct: ${question.answer}`);
      console.log("------");
    });

    toast.success("Answers submitted!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {exam?.name || "Loading Exam..."}
          </CardTitle>
          <p className="text-muted-foreground">{exam?.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {exam?.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-4">
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
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button className="w-full mt-6" onClick={handleSubmit}>
            Submit Exam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
