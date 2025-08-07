"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addExam } from "../action/global-data/add-exam";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { fetchTeacherByEmail } from "@/action/fetch-teacher-by-email";
import { IAnswer, IQuestion } from "@/models/exam";
import { useRouter } from "next/navigation";
import MathInput from "./math-input";
import MathBlock from "./math-block";
import { splitQuestionBySpecialTag } from "@/lib/message-parser";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  duration: z.number().min(0, "There must be duration"),
  questions: z
    .array(
      z.object({
        question: z.string().min(3, "Question must be at least 3 characters"),
        image: z.string().optional(),
        options: z
          .array(
            z.object({
              textAnswer: z.string().optional(),
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

export type IQestionProps = {
  question: string;
  image?: string;
  options: IAnswer[];
};

type QuestionsProps = {
  text?: IQestionProps[];
};

export const Questions = ({ text }: QuestionsProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [teacherId, setTeacherId] = useState<string>("");

  const [propData, setPropData] = useState<IQestionProps[]>(text || []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
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
            { textAnswer: "", image: "" },
            { textAnswer: "", image: "" },
            { textAnswer: "All of the above", image: "" },
            { textAnswer: "None of the above", image: "" },
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

  useEffect(() => {
    if (text && text.length > 0) {
      const newQuestions = text.map((q) => ({
        question: q.question,
        image: q.image || "",
        options: q.options.map((opt) => ({
          ...(opt.textAnswer ? { textAnswer: opt.textAnswer } : {}),
          ...(opt.image ? { image: opt.image } : {}),
          isCorrect: opt.isCorrect || false,
        })),
      }));

      console.log("newQuestions-> ", newQuestions);

      reset({ questions: newQuestions });
    }
  }, [text, reset]);

  useEffect(() => {
    async function fetchTeacherDataByEmail() {
      try {
        const res = await fetchTeacherByEmail({
          email: session?.user?.email || "",
        });
        if (res.success) {
          console.log("teacher: ", res.data);
          setTeacherId(res?.data?._id?.toString() || "");
        } else {
          toast.error(res.message || "Failed to fetch teacher");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching teacher");
      }
    }

    if (session?.user?.email) {
      fetchTeacherDataByEmail();
    }
  }, [session?.user.email]);

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
      const res = await addExam({
        name: data.title,
        description: data.description,
        duration: data.duration,
        questions: data.questions.map((q) => ({
          question: q.question,
          image: q.image || "",
          options: q.options.map((opt) => ({
            ...(opt.textAnswer ? { text: opt.textAnswer } : {}),
            ...(opt.image ? { image: opt.image } : {}),
            isCorrect: opt.isCorrect,
          })),
        })),
        teacherId: teacherId,
      });

      if (res.success) {
        toast.success("Exam added successfully!");
        reset();
        router.push("/");
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Create Exam</CardTitle>
              <CardDescription>
                Create a new exam with multiple choice questions
              </CardDescription>
            </div>
            <div className=" w-max flex gap-2">
              {text && (
                <Button type="button" onClick={() => router.back()}>
                  Back To Chat
                </Button>
              )}

              <Button type="submit" className="flex items-center gap-2">
                Save Exam
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Exam Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Midterm Biology Exam"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration <span className="text-destructive">*</span>
                </Label>

                <div className="flex items-center gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min={0}
                    {...register("duration", { valueAsNumber: true })}
                    placeholder="60"
                  />
                  <span className="text-muted-foreground">minutes</span>
                </div>

                <span className=" text-sm text-gray-400/65 font-medium">
                  If the time is set to 0, the exam will have no time limit.
                </span>
                {errors.duration && (
                  <p className="text-sm text-destructive">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Add exam instructions or additional information"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Button
                type="button"
                onClick={() =>
                  appendQuestion({
                    question: "",
                    options: [
                      { textAnswer: "", image: "" },
                      { textAnswer: "", image: "" },
                      { textAnswer: "All of the above", image: "" },
                      { textAnswer: "None of the above", image: "" },
                    ],
                    answer: "",
                  })
                }
                variant="outline"
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            {errors.questions?.message && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.questions.message}
              </p>
            )}

            {questionFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground">
                  No questions added yet. Click "Add Question" to start.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questionFields.map((field, questionIndex) => (
                  <Card key={field.id} className="relative">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Question {questionIndex + 1}
                        </h3>
                        {questionFields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 ">
                        {splitQuestionBySpecialTag(field.question).map(
                          (part, i) =>
                            part.type === "latex" ? (
                              <span className=" text-blue-400">
                                <MathBlock key={i} item={part.content} />
                              </span>
                            ) : (
                              <span key={i} className=" text-orange-400">
                                {part.content}
                              </span>
                            )
                        )}

                        {/* <Input
                          value={option.textAnswer || ""}
                          onChange={(e) => {
                            const newOptions = [...field.value];
                            newOptions[optionIndex].textAnswer = e.target.value;
                            field.onChange(newOptions);
                          }}
                          placeholder="Option text"
                        /> */}

                        {errors.questions?.[questionIndex]?.question && (
                          <p className="text-sm text-destructive">
                            {errors.questions[questionIndex]?.question?.message}
                          </p>
                        )}
                      </div>

                      {/* Question Image Upload */}
                      <div className="space-y-2">
                        {watch(`questions.${questionIndex}.image`) ? (
                          <div className="relative inline-block">
                            <img
                              src={watch(`questions.${questionIndex}.image`)}
                              alt="Question preview"
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                setValue(`questions.${questionIndex}.image`, "")
                              }
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-md p-4">
                            <label className="flex flex-col items-center gap-2 cursor-pointer">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Add question image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
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
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    {/* Options */}
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-base">
                            Answer Options{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            control={control}
                            name={`questions.${questionIndex}.options`}
                            render={({ field }) => (
                              <Button
                                type="button"
                                onClick={() => {
                                  const newOptions = [...field.value];
                                  newOptions.push({
                                    textAnswer: "",
                                    image: "",
                                    isCorrect: false,
                                  });
                                  field.onChange(newOptions);
                                }}
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                <Plus className="h-4 w-4" />
                                Add Option
                              </Button>
                            )}
                          />
                        </div>

                        <Controller
                          control={control}
                          name={`questions.${questionIndex}.options`}
                          render={({ field }) => (
                            <div className="space-y-3">
                              {field.value.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="p-4 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
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
                                        className="h-4 w-4 rounded border-primary focus:ring-primary text-red-800"
                                      />
                                      <Label
                                        htmlFor={`correct-${questionIndex}-${optionIndex}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        Correct Answer
                                      </Label>
                                    </div>

                                    {field.value.length > 2 && (
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const newOptions = [...field.value];
                                          newOptions.splice(optionIndex, 1);
                                          field.onChange(newOptions);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className=" flex flex-col gap-2">
                                    {splitQuestionBySpecialTag(
                                      option.textAnswer
                                    ).map((part, i) =>
                                      part.type === "latex" ? (
                                        <span className=" text-blue-400">
                                          <MathBlock
                                            key={i}
                                            item={part.content}
                                          />
                                        </span>
                                      ) : (
                                        <span
                                          key={i}
                                          className=" text-orange-400"
                                        >
                                          {part.content}
                                        </span>
                                      )
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                      <Input
                                        value={option.textAnswer || ""}
                                        onChange={(e) => {
                                          const newOptions = [...field.value];
                                          newOptions[optionIndex].textAnswer =
                                            e.target.value;
                                          field.onChange(newOptions);
                                        }}
                                        placeholder="Option text"
                                      />

                                      <div>
                                        {option.image ? (
                                          <div className="relative inline-block">
                                            <img
                                              src={option.image}
                                              alt="Option preview"
                                              className="h-16 object-cover rounded-md border"
                                            />
                                            <Button
                                              type="button"
                                              onClick={() => {
                                                const newOptions = [
                                                  ...field.value,
                                                ];
                                                newOptions[optionIndex].image =
                                                  "";
                                                field.onChange(newOptions);
                                              }}
                                              variant="destructive"
                                              size="icon"
                                              className="absolute -top-2 -right-2"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <div className="border rounded-md p-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm text-muted-foreground">
                                                Add image
                                              </span>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    const reader =
                                                      new FileReader();
                                                    reader.onloadend = () => {
                                                      const newOptions = [
                                                        ...field.value,
                                                      ];
                                                      newOptions[
                                                        optionIndex
                                                      ].image =
                                                        reader.result as string;
                                                      field.onChange(
                                                        newOptions
                                                      );
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                              />
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {questionFields.length > 0 && (
              <Button
                type="button"
                onClick={() =>
                  appendQuestion({
                    question: "",
                    options: [
                      { textAnswer: "", image: "" },
                      { textAnswer: "", image: "" },
                      { textAnswer: "All of the above", image: "" },
                      { textAnswer: "None of the above", image: "" },
                    ],
                    answer: "",
                  })
                }
                variant="outline"
                className="w-full gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Another Question
              </Button>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4">
          {/* <Button type="button" variant="outline">
            Save Draft
          </Button> */}

          <Button type="submit" disabled={isSubmitting}>
            Submit Exam
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
