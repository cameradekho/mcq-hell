"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addExamByUser } from "../../../action/add-exam-by-user";
import { BookOpen, Settings, ListChecks, Eye } from "lucide-react";
import { cn } from "../../lib/utils";

// Component Imports
import { BasicsForm } from "./basics-form";
import { QuestionsForm } from "./questions-form";
import { PreviewForm } from "./preview-form";

// Schema definition
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
              id: z.string(),
              textAnswer: z
                .string()
                .min(1, "Option must be at least 1 character"),
              image: z.string().optional(),
              isCorrect: z.boolean(),
            })
          )
          .min(2, "At least 2 options are required"),
        answer: z
          .array(z.string())
          .min(1, "At least one answer must be selected"),
      })
    )
    .min(1, "At least one question is required"),
});

export type FormValues = z.infer<typeof formSchema>;

type ExamFormProps = {
  userEmail: string;
};

export const QuestionMaker = (props: ExamFormProps) => {
  const [activeStep, setActiveStep] = useState<"basics" | "questions">(
    "basics"
  );
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
    watch,
    trigger,
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
            {
              id: "opt1",
              textAnswer: "",
              image: "",
              isCorrect: false,
            },
            {
              id: "opt2",
              textAnswer: "",
              image: "",
              isCorrect: false,
            },
            {
              id: "opt3",
              textAnswer: "",
              image: "",
              isCorrect: false,
            },
            {
              id: "opt4",
              textAnswer: "All of the above",
              image: "",
              isCorrect: false,
            },
            {
              id: "opt5",
              textAnswer: "None of the above",
              image: "",
              isCorrect: false,
            },
          ],
          answer: [],
        },
      ],
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Exam Schema:", data);

    try {
      const result = await addExamByUser({
        userEmail: props.userEmail || "",
        examName: data.title,
        examDescription: data.description,
        duration: data.duration,
        questions: data.questions.map((q) => ({
          question: q.question,
          image: q.image,
          options: q.options.map((opt) => ({
            text: opt.textAnswer,
            image: opt.image,
            isCorrect: opt.isCorrect,
          })),
        })),
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
    setActiveStep("basics");
  };

  const formValues = watch();

  const nextStep = async () => {
    const isBasicsValid = await trigger(["title", "description", "duration"]);
    if (isBasicsValid) {
      setActiveStep("questions");
    }
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header and Progress Indicator */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Create Exam
            </h1>
          </div>

          <div className="flex items-center space-x-2 bg-muted/30 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveStep("basics")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeStep === "basics"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Basics</span>
            </button>
            <button
              type="button"
              onClick={() => {
                trigger(["title", "description", "duration"]).then(
                  (isValid) => {
                    if (isValid) setActiveStep("questions");
                  }
                );
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeStep === "questions"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <ListChecks className="h-4 w-4" />
              <span>Questions</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                previewMode
                  ? "bg-amber-500 text-white"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Basics Section */}
        {activeStep === "basics" && !previewMode && (
          <BasicsForm register={register} errors={errors} nextStep={nextStep} />
        )}

        {/* Questions Section */}
        {activeStep === "questions" && !previewMode && (
          <QuestionsForm
            control={control}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onBack={() => setActiveStep("basics")}
          />
        )}

        {/* Preview Mode */}
        {previewMode && (
          <PreviewForm
            formValues={formValues}
            onExitPreview={() => setPreviewMode(false)}
          />
        )}
      </form>
    </div>
  );
};
