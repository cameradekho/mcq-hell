"use client";
import React, { useEffect, useState } from "react";
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
import { IExam } from "@/models/exam";

type ExamSessionDateProps = {
  exam: {
    id: string;
  };
  teacher?: {
    _id?: string;
  };
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
  const [basicExamDetails, setBasicExamDetails] = useState<
    Pick<IExam, "name" | "description" | "duration" | "session">
  >({
    name: "",
    description: "",
    duration: 0,
    //session: { startTime: "", endTime: "", date:"" }
  });

  useEffect(() => {
    const fetchExamData = async () => {
      if (!data.exam.id || !data.teacher?._id) return;

      try {
        const res = await fetchExamById({
          teacherId: data.teacher._id,
          examId: data.exam.id,
        });

        if (!res.success) {
          toast.error(res.message);
          return;
        }
        setBasicExamDetails({
          name: res.data.name,
          description: res.data.description,
          duration: res.data.duration,
        });
      } catch (error) {
        console.error("Error fetching exam data:", error);
        toast.error("Failed to fetch exam data");
      }
    };

    fetchExamData();
  }, []);

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
    <div className="space-y-6 p-4">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          {basicExamDetails.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {basicExamDetails.description}
        </p>
        <p className="text-sm text-muted-foreground">
          Duration:{" "}
          <span className="font-medium text-foreground">
            {basicExamDetails.duration} mins
          </span>
        </p>
      </div>

      {/* Selected Date Display */}
      {data.sessionDate && (
        <div className="bg-muted rounded-md p-3">
          <span className="text-sm font-semibold text-primary">
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

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Select Exam Date</Label>
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
                <span className="text-muted-foreground">Pick a date</span>
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

      {/* Time Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BasicTimePicker
          data={{
            label: "Start Time",
            value: startTime,
            onChange: setStartTime,
          }}
        />
        <BasicTimePicker
          data={{
            label: "End Time",
            value: endTime,
            onChange: setEndTime,
          }}
        />
      </div>

      {/* Selection Summary */}
      <div className="rounded-md bg-muted p-4 text-sm space-y-1 text-muted-foreground">
        <p>
          <strong>Date:</strong>{" "}
          {data.sessionDate?.toLocaleDateString("en-US") || "Not selected"}
        </p>
        <p>
          <strong>Start Time:</strong>{" "}
          {startTime?.format("HH:mm") || "Not selected"}
        </p>
        <p>
          <strong>End Time:</strong>{" "}
          {endTime?.format("HH:mm") || "Not selected"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleClickReset}>
          Reset
        </Button>
        <Button onClick={handleSessionSave}>Save Changes</Button>
      </div>

      {/* Instruction */}
      <p className="text-sm text-muted-foreground pt-2">
        Please select the exam date and time to publish the exam schedule.
      </p>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setDialogOpen(false)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCopyLink}
          disabled={!enableSave}
          className="flex-1"
        >
          Copy Exam Link
        </Button>
      </div>
    </div>
  );
};
