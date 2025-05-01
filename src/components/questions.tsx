"use client";
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addExamByUser } from "../../action/add-exam-by-user";
import { addExam } from "../../action/demo/add-exam";

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
        image: z.string().optional(),
        options: z
          .array(
            z.object({
              text: z.string().optional(),
              image: z.string().optional(),
              isCorrect: z.boolean().optional(),
            })
          )
          .min(2, "At least 2 options are required"),
        answer: z.string().optional(),
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
          image: "",
          options: [
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "All of the above", image: "" },
            { text: "None of the above", image: "" },
          ],
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

    if (data.questions.length > 0) {
      for (const question of data.questions) {
        // Check if there is at least one correct answer
        if (
          question.options.map((opt) => opt.isCorrect === true).filter(Boolean)
            .length < 1
        ) {
          toast.error(
            "Please select at least 1 correct answer for each question"
          );
          return; // Return early to stop further execution and form submission
        }
      }
    }

    try {
      const result = await addExamByUser({
        userEmail: props.userEmail || "",
        examName: data.title,
        examDescription: data.description,
        duration: data.duration,
        questions: data.questions.map((q) => ({
          question: q.question,
          image: q.image || "",
          options: q.options.map((opt) => ({
            ...(opt.text ? { text: opt.text } : {}),
            ...(opt.image ? { image: opt.image } : {}),
            isCorrect: opt.isCorrect,
          })),
        })),
      });

      if (result.success) {
        toast.success("Exam added successfully!");

        const res = await addExam({
          name: data.title,
          description: data.description,
          duration: data.duration,
          questions: data.questions.map((q) => ({
            question: q.question,
            image: q.image || "",
            options: q.options.map((opt) => ({
              ...(opt.text ? { text: opt.text } : {}),
              ...(opt.image ? { image: opt.image } : {}),
              isCorrect: opt.isCorrect,
            })),
          })),
          createdName: "",
          createdByEmail: props.userEmail || "",
        });

        if (res.success) {
          toast.success("Exam added successfully!");
        } else {
          toast.error(res.message);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error adding exam by user: " + error);
    }
    reset();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold">Create Exam</h1>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Save Exam</span>
          </button>
        </div>

        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Exam Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Midterm Biology Exam"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Duration <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  {...register("duration", { valueAsNumber: true })}
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="60"
                />
                <span className="ml-2 text-gray-500">minutes</span>
              </div>
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Add exam instructions or additional information"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Questions</h2>
            <button
              type="button"
              onClick={() =>
                appendQuestion({
                  question: "",
                  options: [
                    { text: "", image: "" },
                    { text: "", image: "" },
                    { text: "All of the above", image: "" },
                    { text: "None of the above", image: "" },
                  ],
                  answer: "",
                })
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <span>Add Question</span>
            </button>
          </div>

          {errors.questions?.message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-red-600 text-sm">{errors.questions.message}</p>
            </div>
          )}

          {questionFields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">
                No questions added yet. Click "Add Question" to start.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questionFields.map((field, questionIndex) => (
                <div
                  key={field.id}
                  className="border border-gray-200 p-5 rounded-lg mb-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-lg font-medium">
                      Question {questionIndex + 1}
                    </h3>
                    {questionFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                      >
                        Remove Question
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`questions.${questionIndex}.question`)}
                      className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your question here"
                    />
                    {errors.questions?.[questionIndex]?.question && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.questions[questionIndex]?.question?.message}
                      </p>
                    )}
                  </div>

                  {/* Images Upload */}
                  <div className="mb-6">
                    <label className="block mb-2 font-medium text-gray-700">
                      Question Image (optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      {watch(`questions.${questionIndex}.image`) ? (
                        <div className="relative">
                          <img
                            src={watch(`questions.${questionIndex}.image`)}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setValue(`questions.${questionIndex}.image`, "")
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setValue(
                                    `questions.${questionIndex}.image`,
                                    reader.result as string
                                  );
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block font-medium text-gray-700">
                        Answer Options <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name={`questions.${questionIndex}.options`}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...field.value];
                              newOptions.push({
                                text: "",
                                image: "",
                                isCorrect: false,
                              });
                              field.onChange(newOptions);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <span>Add Option</span>
                          </button>
                        )}
                      />
                    </div>

                    <Controller
                      control={control}
                      name={`questions.${questionIndex}.options`}
                      render={({ field }) => (
                        <div className="space-y-4">
                          {field.value.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-500 mr-2">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <input
                                    type="checkbox"
                                    id={`correct-${questionIndex}-${optionIndex}`}
                                    checked={option.isCorrect || false}
                                    onChange={(e) => {
                                      const newOptions = [...field.value];
                                      newOptions[optionIndex].isCorrect =
                                        e.target.checked;
                                      field.onChange(newOptions);
                                    }}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={`correct-${questionIndex}-${optionIndex}`}
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    Correct Answer
                                  </label>
                                </div>

                                {field.value.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOptions = [...field.value];
                                      newOptions.splice(optionIndex, 1);
                                      field.onChange(newOptions);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {/* Text input for option */}
                                <div>
                                  <input
                                    value={option.text || ""}
                                    onChange={(e) => {
                                      const newOptions = [...field.value];
                                      newOptions[optionIndex].text =
                                        e.target.value;
                                      field.onChange(newOptions);
                                    }}
                                    className="w-full border p-2 rounded-md"
                                    placeholder={`Option text`}
                                  />
                                </div>

                                {/* Image upload */}
                                <div>
                                  {option.image ? (
                                    <div className="relative inline-block">
                                      <img
                                        src={option.image}
                                        alt="Option preview"
                                        className="h-16 object-cover rounded-md border"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newOptions = [...field.value];
                                          newOptions[optionIndex].image = "";
                                          field.onChange(newOptions);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const newOptions = [...field.value];
                                            newOptions[optionIndex].image =
                                              reader.result as string;
                                            field.onChange(newOptions);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {errors.questions?.[questionIndex]?.options && (
                            <p className="text-red-500 text-sm">
                              {
                                errors.questions[questionIndex]?.options
                                  ?.message
                              }
                            </p>
                          )}
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
            </div>
          )}

          {questionFields.length > 0 && (
            <button
              type="button"
              onClick={() =>
                appendQuestion({
                  question: "",
                  options: [
                    { text: "", image: "" },
                    { text: "", image: "" },
                    { text: "All of the above", image: "" },
                    { text: "None of the above", image: "" },
                  ],
                  answer: "",
                })
              }
              className="mt-6 px-4 py-2 border border-green-600 text-green-700 bg-white rounded-md hover:bg-green-50 transition-colors w-full"
            >
              + Add Another Question
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Exam
          </button>
        </div>
      </form>
    </div>
  );
};
