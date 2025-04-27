"use client";
import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  useFieldArray,
  Controller,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { cn } from "../../lib/utils";
import { FormValues } from "./index";
import {
  Plus,
  Trash2,
  XCircle,
  Upload,
  AlertCircle,
  Save,
  ListChecks,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { QuestionItem } from "./question-item";
import { Button } from "../ui/button";

type QuestionsFormProps = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  onBack: () => void;
};

export const QuestionsForm = ({
  register,
  errors,
  control,
  watch,
  setValue,
  onBack,
}: QuestionsFormProps) => {
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Questions ({questionFields.length})
          </h2>
        </div>

        {errors.questions?.message && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errors.questions.message}
          </div>
        )}

        <div className="space-y-4">
          {questionFields.map((field, questionIndex) => (
            <QuestionItem
              key={field.id}
              field={field}
              questionIndex={questionIndex}
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              canRemove={questionFields.length > 1}
              onRemove={() => removeQuestion(questionIndex)}
            />
          ))}
        </div>

        <Button
          type="button"
          onClick={() =>
            appendQuestion({
              question: "",
              image: "",
              options: [
                {
                  id: `opt-${Math.random().toString(36).substring(2, 9)}`,
                  textAnswer: "",
                  image: "",
                  isCorrect: false,
                },
                {
                  id: `opt-${Math.random().toString(36).substring(2, 9)}`,
                  textAnswer: "",
                  image: "",
                  isCorrect: false,
                },
              ],
              answer: [],
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add Question
        </Button>
      </div>
      <div className="flex items-center justify-between p-6 pt-0">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Settings
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" /> Submit Exam
        </Button>
      </div>
    </div>
  );
};
