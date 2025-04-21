"use client";
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addExamByUser } from "../../action/add-exam-by-user";

type QuestionProps = {
  userEmail: string;
};

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  questions: z
    .array(
      z.object({
        question: z.string().min(3, "Question must be at least 3 characters"),
        options: z
          .array(z.string().min(1, "Option must be at least 1 character"))
          .min(2, "At least 2 options are required"),
        answer: z.string().min(1, "Answer must be selected"),
      })
    )
    .min(1, "At least one question is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const Questions = (props: QuestionProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 1,
      questions: [
        {
          question: "",
          options: ["", ""],
          answer: "",
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Exam Schema:", data);

    try {
      const result = await addExamByUser({
        userEmail: props.userEmail || "",
        examName: data.title,
        examDescription: data.description,
        duration: data.duration,
        questions: data.questions as [],
      });

      if (result.success) {
        toast.success("Exam added successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error adding exam by user: " + error);
    }
    reset();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Create Exam</h1>

        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              {...register("title")}
              className="w-full border p-2 rounded"
              placeholder="Exam Title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              {...register("description")}
              className="w-full border p-2 rounded"
              placeholder="Describe your exam"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              {...register("duration", { valueAsNumber: true })}
              className="w-full border p-2 rounded"
              placeholder="Duration in minutes"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          {errors.questions?.message && (
            <p className="text-red-500 text-sm mb-2">
              {errors.questions.message}
            </p>
          )}

          {questionFields.map((field, questionIndex) => (
            <div key={field.id} className="border p-4 rounded-lg mb-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Question {questionIndex + 1}
                </h3>
                {questionFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Question Text</label>
                <input
                  {...register(`questions.${questionIndex}.question`)}
                  className="w-full border p-2 rounded"
                  placeholder="Enter question"
                />
                {errors.questions?.[questionIndex]?.question && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.questions[questionIndex]?.question?.message}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Options</label>
                <Controller
                  control={control}
                  name={`questions.${questionIndex}.options`}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...field.value];
                              newOptions[optionIndex] = e.target.value;
                              field.onChange(newOptions);

                              // Update answer if it was previously set to this option
                              const currentAnswer = watch(
                                `questions.${questionIndex}.answer`
                              );
                              if (currentAnswer === field.value[optionIndex]) {
                                setValue(
                                  `questions.${questionIndex}.answer`,
                                  e.target.value
                                );
                              }
                            }}
                            className="flex-1 border p-2 rounded"
                            placeholder={`Option ${optionIndex + 1}`}
                          />

                          {/* Mark as answer switch */}
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`answer-${questionIndex}-${optionIndex}`}
                              name={`answer-${questionIndex}`}
                              checked={
                                watch(`questions.${questionIndex}.answer`) ===
                                option
                              }
                              onChange={() => {
                                setValue(
                                  `questions.${questionIndex}.answer`,
                                  option
                                );
                              }}
                              className="mr-2"
                              disabled={!option.trim()}
                            />
                            <label
                              htmlFor={`answer-${questionIndex}-${optionIndex}`}
                            >
                              Correct Answer
                            </label>
                          </div>

                          {/* Remove option button */}
                          {field.value.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...field.value];
                                const removedOption = newOptions[optionIndex];
                                newOptions.splice(optionIndex, 1);
                                field.onChange(newOptions);

                                // If the removed option was the answer, clear the answer
                                if (
                                  watch(`questions.${questionIndex}.answer`) ===
                                  removedOption
                                ) {
                                  setValue(
                                    `questions.${questionIndex}.answer`,
                                    ""
                                  );
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      {errors.questions?.[questionIndex]?.options && (
                        <p className="text-red-500 text-sm">
                          {errors.questions[questionIndex]?.options?.message}
                        </p>
                      )}

                      {/* Add option button */}
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange([...field.value, ""]);
                        }}
                        className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Add Option
                      </button>
                    </div>
                  )}
                />
              </div>

              {errors.questions?.[questionIndex]?.answer && (
                <p className="text-red-500 text-sm">
                  {errors.questions[questionIndex]?.answer?.message}
                </p>
              )}

              {/* Hidden input to track the answer */}
              <input
                type="hidden"
                {...register(`questions.${questionIndex}.answer`)}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendQuestion({
                question: "",
                options: ["", ""],
                answer: "",
              })
            }
            className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            Add Question
          </button>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit Exam
        </button>
      </form>
    </div>
  );
};
