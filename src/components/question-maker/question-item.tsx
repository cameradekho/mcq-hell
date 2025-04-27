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
import { InlineMath, BlockMath } from "react-katex";
import LatexSymbolPicker, { tryRenderLatex } from "./latex-symbol-picker";

// LaTeX symbol categories and symbols
const latexSymbols = [
  {
    category: "Greek Letters",
    symbols: [
      { symbol: "\\alpha", display: "α" },
      { symbol: "\\beta", display: "β" },
      { symbol: "\\gamma", display: "γ" },
      { symbol: "\\delta", display: "δ" },
      { symbol: "\\epsilon", display: "ε" },
      { symbol: "\\zeta", display: "ζ" },
      { symbol: "\\eta", display: "η" },
      { symbol: "\\theta", display: "θ" },
      { symbol: "\\iota", display: "ι" },
      { symbol: "\\kappa", display: "κ" },
      { symbol: "\\lambda", display: "λ" },
      { symbol: "\\mu", display: "μ" },
      { symbol: "\\nu", display: "ν" },
      { symbol: "\\xi", display: "ξ" },
      { symbol: "\\pi", display: "π" },
      { symbol: "\\rho", display: "ρ" },
      { symbol: "\\sigma", display: "σ" },
      { symbol: "\\tau", display: "τ" },
      { symbol: "\\upsilon", display: "υ" },
      { symbol: "\\phi", display: "φ" },
      { symbol: "\\chi", display: "χ" },
      { symbol: "\\psi", display: "ψ" },
      { symbol: "\\omega", display: "ω" },
    ],
  },
  {
    category: "Operators",
    symbols: [
      { symbol: "+", display: "+" },
      { symbol: "-", display: "-" },
      { symbol: "\\times", display: "×" },
      { symbol: "\\div", display: "÷" },
      { symbol: "\\pm", display: "±" },
      { symbol: "\\cdot", display: "·" },
      { symbol: "\\cup", display: "∪" },
      { symbol: "\\cap", display: "∩" },
      { symbol: "\\setminus", display: "∖" },
      { symbol: "\\subset", display: "⊂" },
      { symbol: "\\subseteq", display: "⊆" },
      { symbol: "\\in", display: "∈" },
      { symbol: "\\notin", display: "∉" },
      { symbol: "\\emptyset", display: "∅" },
      { symbol: "\\equiv", display: "≡" },
    ],
  },
  {
    category: "Calculus",
    symbols: [
      { symbol: "\\int", display: "∫" },
      { symbol: "\\oint", display: "∮" },
      { symbol: "\\partial", display: "∂" },
      { symbol: "\\nabla", display: "∇" },
      { symbol: "\\sum", display: "∑" },
      { symbol: "\\prod", display: "∏" },
      { symbol: "\\lim", display: "lim" },
      { symbol: "\\infty", display: "∞" },
      { symbol: "\\frac{a}{b}", display: "a/b" },
      { symbol: "\\sqrt{x}", display: "√x" },
      { symbol: "\\sqrt[n]{x}", display: "ⁿ√x" },
    ],
  },
  {
    category: "Relations",
    symbols: [
      { symbol: "=", display: "=" },
      { symbol: "\\neq", display: "≠" },
      { symbol: "<", display: "<" },
      { symbol: ">", display: ">" },
      { symbol: "\\leq", display: "≤" },
      { symbol: "\\geq", display: "≥" },
      { symbol: "\\approx", display: "≈" },
      { symbol: "\\sim", display: "∼" },
      { symbol: "\\cong", display: "≅" },
      { symbol: "\\propto", display: "∝" },
    ],
  },
  {
    category: "Arrows",
    symbols: [
      { symbol: "\\rightarrow", display: "→" },
      { symbol: "\\leftarrow", display: "←" },
      { symbol: "\\Rightarrow", display: "⇒" },
      { symbol: "\\Leftarrow", display: "⇐" },
      { symbol: "\\mapsto", display: "↦" },
      { symbol: "\\leftrightarrow", display: "↔" },
      { symbol: "\\Leftrightarrow", display: "⇔" },
    ],
  },
  {
    category: "Templates",
    symbols: [
      { symbol: "x^2", display: "x²" },
      { symbol: "x_i", display: "xᵢ" },
      { symbol: "\\frac{dy}{dx}", display: "dy/dx" },
      {
        symbol: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}",
        display: "matrix",
      },
      {
        symbol: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
        display: "(matrix)",
      },
      {
        symbol: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
        display: "[matrix]",
      },
    ],
  },
];

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
        <div className="space-y-1">
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
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Image (optional)</label>
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
                      "flex items-center justify-center border border-dashed border-input rounded-md p-4 transition-colors h-[175px]",
                      isDragActive ? "bg-primary/10 border-primary" : "",
                      field.value ? "bg-muted/30" : "hover:bg-muted/50",
                      "cursor-pointer"
                    )}
                  >
                    {!field.value ? (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
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
                          alt="Preview"
                          className="max-h-[140px] max-w-full object-contain rounded-md"
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

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Answer Options</label>
            </div>

            <Controller
              control={control}
              name={`questions.${questionIndex}.options`}
              render={({ field }) => (
                <div className="space-y-2 bg-muted/20 p-3 rounded-md max-h-[175px] overflow-y-auto">
                  {field.value.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`answer-${questionIndex}-${optionIndex}`}
                        name={`answer-${questionIndex}`}
                        checked={
                          watch(`questions.${questionIndex}.answer`) === option
                        }
                        onChange={() => {
                          setValue(`questions.${questionIndex}.answer`, option);
                        }}
                        className="h-4 w-4 accent-primary"
                        disabled={!option.trim()}
                      />
                      <div className="flex-1 relative">
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
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          )}
                          placeholder={`Option ${
                            optionIndex + 1
                          } (supports LaTeX: $x^2$)`}
                        />
                        {option.includes("$") && (
                          <div className="absolute right-10 top-2">
                            {tryRenderLatex(option)}
                          </div>
                        )}
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
                              setValue(`questions.${questionIndex}.answer`, "");
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
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
                      field.onChange([...field.value, ""]);
                    }}
                    className="mt-2 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Option
                  </button>
                </div>
              )}
            />
          </div>
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
