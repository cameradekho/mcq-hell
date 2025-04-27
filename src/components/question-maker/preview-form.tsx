"use client";
import React from "react";
import { cn } from "../../lib/utils";
import { FormValues } from "./index";
import { Timer, Eye } from "lucide-react";

type PreviewFormProps = {
  formValues: FormValues;
  onExitPreview: () => void;
};

export const PreviewForm = ({
  formValues,
  onExitPreview,
}: PreviewFormProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            Exam Preview
          </h2>
          <button
            type="button"
            onClick={onExitPreview}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Exit Preview
          </button>
        </div>

        <div className="space-y-8">
          {/* Preview Basic Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {formValues.title || "Untitled Exam"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formValues.description || "No description provided"}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Duration: {formValues.duration} minutes</span>
            </div>
          </div>

          {/* Preview Questions */}
          <div className="space-y-6">
            {formValues.questions.map((question, index) => (
              <div key={index} className="p-4 border rounded-md bg-muted/10">
                <div className="flex items-start gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-md font-medium">
                      {question.question || `Question ${index + 1}`}
                    </h4>
                  </div>
                </div>

                {question.image && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={question.image}
                      alt={`Question ${index + 1} image`}
                      className="max-h-32 object-contain rounded-md"
                    />
                  </div>
                )}

                <div className="ml-8 space-y-2">
                  {question.options.map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center",
                          question.answer === option
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground"
                        )}
                      >
                        {question.answer === option && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          question.answer === option && "font-medium"
                        )}
                      >
                        {option || `Option ${optIdx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
