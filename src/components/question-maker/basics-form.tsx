"use client";
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "../../lib/utils";
import { FormValues } from "./index";
import {
  Pencil,
  Timer,
  FileText,
  ArrowRight,
  AlertCircle,
  Settings,
} from "lucide-react";

type BasicsFormProps = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  nextStep: () => void;
};

export const BasicsForm = ({ register, errors, nextStep }: BasicsFormProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Exam Settings
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium leading-none">Title</label>
            </div>
            <input
              {...register("title")}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.title &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Enter exam title"
            />
            {errors.title && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium leading-none">
                Description
              </label>
            </div>
            <textarea
              {...register("description")}
              className={cn(
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.description &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Describe your exam"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium leading-none">
                Duration (minutes)
              </label>
            </div>
            <input
              type="number"
              min={1}
              {...register("duration", { valueAsNumber: true })}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.duration &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Duration in minutes"
            />
            {errors.duration && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {errors.duration.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end p-6 pt-0">
        <button
          type="button"
          onClick={nextStep}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
