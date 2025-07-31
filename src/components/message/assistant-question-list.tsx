"use client";

import { IQuestion } from "@/models/exam";
import { useQuestionContext } from "@/providers/question-provider";
import { useRouter } from "next/navigation";

type AssistantQuestionListProps = {
  text: IQuestion[];
};

export const AssistantQuestionList: React.FC<AssistantQuestionListProps> = ({
  text = [],
}) => {
  const router = useRouter();
  console.log("text", text);

  const { setIsAIQuestionExists, setQuestions } = useQuestionContext();

  const handleClickSaveExam = async () => {
    setIsAIQuestionExists(true);
    setQuestions(text);
    router.push("/add-exam");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-gray-600">{text.length} questions available</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Edit this list
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            disabled={text.length === 0}
            onClick={() => handleClickSaveExam()}
          >
            Save Exam
          </button>
        </div>
      </div>

      {/* Questions List */}
      {text.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-500">Add some questions to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {text.map((item: IQuestion, index: number) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            >
              {/* Question */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700 leading-relaxed">{item.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 mb-2">Options:</h4>
                {item.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-lg border-2 ${
                      option.isCorrect
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="font-medium text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option.textAnswer}</span>
                    {option.isCorrect && (
                      <span className="ml-auto text-green-600 font-medium text-sm">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Answer Summary */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  Correct Answer(s): {item.answer?.length || 0} option(s)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
