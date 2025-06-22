"use client";
import React, { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { ChevronDown, Copy, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "../../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../../../../../components/ui/calendar";
import BasicTimePicker from "@/components/ui/basic-time-picker";
import { Dayjs } from "dayjs";
import { toast } from "sonner";
import { addSessionInExam } from "@/action/add-session-in-exam";
import { fetchExamById } from "@/action/fetch-exam-by-id";
import { deleteSessionInExam } from "@/action/delete-session-in-exam";

type ExamSessionDateProps = {
  exam: {
    id: string;
  };
  teacher?: {
    _id?: string;
  };
  handleCopyExamLink: (params: { examId: string; teacherId: string }) => void;
  sessionDate: Date | undefined;
  setSessionDate: (date: Date | undefined) => void;
};

type ExamSessionType = {
  examDate: Date;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
};

export const ExamSessionDate = ({ data }: { data: ExamSessionDateProps }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [enableSave, setEnableSave] = useState(false);

  const [examSession, setExamSession] = useState<ExamSessionType>({
    examDate: new Date(),
    startTime: startTime || null,
    endTime: endTime || null,
  });

  const handleDateSelect = (date: Date | undefined) => {
    data.setSessionDate(date);
    setCalendarOpen(false);
  };

  const handleCopyLink = () => {
    if (!data.sessionDate || !startTime || !endTime) {
      toast.error("Please select date and time first");
      return;
    }

    // const examLink = `${window.location.origin}/exam/${data.teacher?._id}/${
    //   data.exam.id
    // }?date=${data.sessionDate.toISOString()}&start=${startTime.format(
    //   "HH:mm"
    // )}&end=${endTime.format("HH:mm")}`;

    const examLink = `${window.location.origin}/exam/${data.teacher?._id}/${data.exam.id}`;

    navigator.clipboard.writeText(examLink);
    toast.success("Exam link copied to clipboard!");
  };

  const handleSessionSave = async () => {
    if (!data.sessionDate) {
      alert("Please select a date first");
      return;
    }

    if (!startTime) {
      alert("Please select a start time first");
      return;
    }

    if (!endTime) {
      alert("Please select an end time first");
      return;
    }

    try {
      const res = await addSessionInExam({
        teacherId: data.teacher?._id || "",
        examId: data.exam.id,
        sessionDate: data.sessionDate,
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setEnableSave(true);

      setExamSession({
        examDate: data.sessionDate,
        startTime: startTime,
        endTime: endTime,
      });

      toast.success("Session added successfully");
    } catch (error) {
      toast.error("Error adding session");
      console.error(error);
    }
  };

  const handleClickReset = async () => {
    try {
      const res = await deleteSessionInExam({
        teacherId: data.teacher?._id?.toString() || "",
        examId: data.exam.id,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Session deleted successfully");
      setStartTime(null);
      setEndTime(null);
      data.setSessionDate(undefined);
      setEnableSave(false);
    } catch (error) {
      console.error(error);
      toast.error("Error resetting session");
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {data.sessionDate && (
          <div className="p-3 bg-muted rounded-md">
            <span className="text-sm font-medium">
              Selected Date:{" "}
              {data.sessionDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Select Exam Date</Label>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.sessionDate ? (
                  data.sessionDate.toLocaleDateString()
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.sessionDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <BasicTimePicker
            data={{
              label: "Exam Start Time",
              value: startTime,
              onChange: setStartTime,
            }}
          />
          <BasicTimePicker
            data={{
              label: "Exam End Time",
              value: endTime,
              onChange: setEndTime,
            }}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>Selected Date: {data.sessionDate?.toLocaleDateString()}</span>
          <span>Start Time: {startTime?.format("HH:mm")}</span>
          <span>End Time: {endTime?.format("HH:mm")}</span>
          <div className=" flex items-center justify-between gap-4">
            <Button variant="outline" onClick={handleClickReset}>
              Reset
            </Button>
            <Button onClick={handleSessionSave}>Save Changes</Button>
          </div>
        </div>

        <span>
          Please select the exam date and time, when to live the exam.
        </span>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            onClick={handleCopyLink}
            disabled={enableSave === false}
            className="flex-1"
          >
            Copy Exam Link
          </Button>
        </div>
      </div>
    </div>
  );
};
