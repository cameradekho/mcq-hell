// app/exam/page.tsx
"use client";

import { useState } from "react";
export const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Mars",
  },
  {
    question: "What is the boiling point of water?",
    options: ["90°C", "50°C", "100°C", "150°C"],
    correctAnswer: "100°C",
  },
  {
    question: "Who wrote 'Hamlet'?",
    options: ["Charles Dickens", "Shakespeare", "Leo Tolstoy", "Mark Twain"],
    correctAnswer: "Shakespeare",
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: "Carbon Dioxide",
  },
];

const ExamPage = () => {
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [result, setResult] = useState<number | null>(null);

  const handleOptionChange = (
    questionIndex: number,
    selectedOption: string
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOption;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) {
        score++;
      }
    });
    setResult(score);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Exam</h1>

      {questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold mb-2">
            {i + 1}. {q.question}
          </p>
          <div className="space-y-1">
            {q.options.map((option, j) => (
              <label key={j} className="block">
                <input
                  type="radio"
                  name={`question-${i}`}
                  value={option}
                  checked={answers[i] === option}
                  onChange={() => handleOptionChange(i, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>

      {result !== null && (
        <div className="mt-6 text-xl font-medium">
          You scored {result} out of {questions.length}
        </div>
      )}
    </div>
  );
};

export default ExamPage;
