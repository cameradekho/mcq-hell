"use client";
import React, { useState } from "react";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  FieldArrayWithId,
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
  Sigma,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import "katex/dist/katex.min.css";
import LatexSymbolPicker, { tryRenderLatex } from "./latex-symbol-picker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type QuestionItemProps = {
  field: FieldArrayWithId<FormValues, "questions", "id">;
  questionIndex: number;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  canRemove: boolean;
  onRemove: () => void;
};

export const QuestionItem = ({
  field,
  questionIndex,
  register,
  control,
  errors,
  watch,
  setValue,
  canRemove,
  onRemove,
}: QuestionItemProps) => {
  const [showLatexPicker, setShowLatexPicker] = useState(false);
  const [previewLatex, setPreviewLatex] = useState(false);

  // Insert LaTeX symbol at cursor position in the input
  const insertLatexSymbol = (symbol: string) => {
    const inputEl = document.getElementById(
      `question-${questionIndex}`
    ) as HTMLInputElement;
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    const questionText = watch(`questions.${questionIndex}.question`) || "";

    const newText =
      questionText.substring(0, start) + symbol + questionText.substring(end);
    setValue(`questions.${questionIndex}.question`, newText);

    // Focus back on input after symbol insertion
    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // Toggle between raw LaTeX and rendered preview
  const togglePreview = () => {
    setPreviewLatex(!previewLatex);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {questionIndex + 1}
            </span>
            Question {questionIndex + 1}
          </h3>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Question Text</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePreview}
                className="text-xs px-2 py-1 rounded-md border border-input hover:bg-accent"
              >
                {previewLatex ? "Edit LaTeX" : "Preview Math"}
              </button>
              <button
                type="button"
                onClick={() => setShowLatexPicker(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8"
                aria-label="Insert LaTeX symbol"
              >
                <Sigma className="h-4 w-4" />
              </button>
              {showLatexPicker && (
                <LatexSymbolPicker
                  onSelectSymbol={insertLatexSymbol}
                  onClose={() => setShowLatexPicker(false)}
                />
              )}
            </div>
          </div>

          {previewLatex ? (
            <div className="border border-input rounded-md p-3 bg-background min-h-10">
              <div className="latex-preview">
                {tryRenderLatex(
                  watch(`questions.${questionIndex}.question`) || ""
                )}
              </div>
            </div>
          ) : (
            <input
              id={`question-${questionIndex}`}
              {...register(`questions.${questionIndex}.question`)}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.questions?.[questionIndex]?.question &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Enter question (supports LaTeX: $x^2$ for inline, $$\int f(x) dx$$ for block)"
            />
          )}

          {errors.questions?.[questionIndex]?.question && (
            <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4" />
              {errors.questions[questionIndex]?.question?.message}
            </p>
          )}

          {/* Question Image Upload - Moved here to be associated with the question text */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Question Image (optional)
            </label>
            <Controller
              control={control}
              name={`questions.${questionIndex}.image`}
              render={({ field }) => {
                const { getRootProps, getInputProps, isDragActive } =
                  useDropzone({
                    accept: {
                      "image/*": [],
                    },
                    multiple: false,
                    onDrop: (acceptedFiles) => {
                      if (acceptedFiles.length > 0) {
                        const file = acceptedFiles[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          field.onChange(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    },
                  });

                return (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex items-center justify-center border border-dashed border-input rounded-md p-4 transition-colors h-[130px]",
                      isDragActive ? "bg-primary/10 border-primary" : "",
                      field.value ? "bg-muted/30" : "hover:bg-muted/50",
                      "cursor-pointer"
                    )}
                  >
                    {!field.value ? (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-sm text-muted-foreground text-center">
                          {isDragActive
                            ? "Drop the image here"
                            : "Drag & drop or click to upload an image"}
                        </p>
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={field.value}
                          alt="Question image"
                          className="max-h-[110px] max-w-full object-contain rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange("");
                          }}
                          className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-xs text-destructive-foreground hover:bg-destructive/90"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <input {...getInputProps()} />
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Visual separator between question and answer sections */}
        <div className="border-t my-4"></div>

        {/* Answer Options section - now comes after the separator */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Answer Options</label>
          </div>

          <Controller
            control={control}
            name={`questions.${questionIndex}.options`}
            render={({ field }) => (
              <div className="flex flex-col gap-2 bg-muted/20 p-3 rounded-md h-fit">
                {field.value.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <input
                      type="radio"
                      id={`answer-${questionIndex}-${optionIndex}`}
                      name={`answer-${questionIndex}`}
                      checked={watch(
                        `questions.${questionIndex}.answer`
                      ).includes(option.id)}
                      onChange={() => {
                        setValue(`questions.${questionIndex}.answer`, [
                          option.id,
                        ]);

                        // Update isCorrect for all options
                        const newOptions = [...field.value];
                        newOptions.forEach((opt, idx) => {
                          opt.isCorrect = idx === optionIndex;
                        });
                        field.onChange(newOptions);
                      }}
                      className="h-4 w-4 accent-primary"
                      disabled={!option.textAnswer.trim()}
                    />
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          value={option.textAnswer}
                          onChange={(e) => {
                            const newOptions = [...field.value];
                            newOptions[optionIndex] = {
                              ...newOptions[optionIndex],
                              textAnswer: e.target.value,
                            };
                            field.onChange(newOptions);
                          }}
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          )}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        {option.textAnswer.includes("$") && (
                          <div className="absolute right-10 top-2">
                            {tryRenderLatex(option.textAnswer)}
                          </div>
                        )}
                      </div>

                      {/* Option Image Upload */}
                      <div className="mt-2">
                        {option.image ? (
                          <div className="relative mt-1 h-[60px]">
                            <img
                              src={option.image}
                              alt="Option image"
                              className="max-h-[60px] max-w-full object-contain rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...field.value];
                                newOptions[optionIndex] = {
                                  ...newOptions[optionIndex],
                                  image: "",
                                };
                                field.onChange(newOptions);
                              }}
                              className="absolute top-0 right-0 rounded-full bg-destructive p-1 text-xs text-destructive-foreground hover:bg-destructive/90"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newOptions = [...field.value];
                                  newOptions[optionIndex] = {
                                    ...newOptions[optionIndex],
                                    image: reader.result as string,
                                  };
                                  field.onChange(newOptions);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-fit cursor-pointer"
                          />
                        )}
                      </div>
                    </div>

                    {/* Remove option button */}
                    {field.value.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newOptions = [...field.value];
                          const removedOption = newOptions[optionIndex];
                          newOptions.splice(optionIndex, 1);
                          field.onChange(newOptions);

                          // If the removed option was the answer, clear the answer
                          if (
                            watch(`questions.${questionIndex}.answer`).includes(
                              removedOption.id
                            )
                          ) {
                            setValue(`questions.${questionIndex}.answer`, []);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                {errors.questions?.[questionIndex]?.options && (
                  <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.questions[questionIndex]?.options?.message}
                  </p>
                )}

                {/* Add option button */}
                <button
                  type="button"
                  onClick={() => {
                    const newId = Math.random().toString(36).substring(2, 9);
                    field.onChange([
                      ...field.value,
                      {
                        id: newId,
                        textAnswer: "",
                        image: "",
                        isCorrect: false,
                      },
                    ]);
                  }}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Option
                </button>
              </div>
            )}
          />
        </div>

        {errors.questions?.[questionIndex]?.answer && (
          <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4" />
            {errors.questions[questionIndex]?.answer?.message}
          </p>
        )}

        {/* Hidden input to track the answer */}
        <input
          type="hidden"
          {...register(`questions.${questionIndex}.answer`)}
        />
      </div>
    </div>
  );
};
