"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "../../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../../../../../components/ui/calendar";
import BasicTimePicker from "@/components/ui/basic-time-picker";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "sonner";
import { addExamSession } from "@/action/add-session-in-exam";
import { deleteExamSession } from "@/action/delete-session-in-exam";
import { IExam } from "@/models/exam";
import { IExamSession } from "@/models/teacher-exam-session";
import { set } from "date-fns";
import { de } from "date-fns/locale";

type ExamSessionDateProps = {
  exam: {
    _id: string;
  };
  teacher?: {
    _id?: string;
  };
  sessionDate: Dayjs | undefined;
  setSessionDate: (date: Dayjs | undefined) => void;
  existingSessionData?: IExamSession;
  enableCopy: boolean;
  setEnableCopy: (enable: boolean) => void;
  basicExamDetails: Pick<IExam, "name" | "description" | "duration">;
};

type ExamSessionType = {
  examDate: Dayjs;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
};

export const ExamSessionDate = ({
  data: examSessionData,
}: {
  data: ExamSessionDateProps;
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [examSession, setExamSession] = useState<ExamSessionType>({
    examDate: dayjs(),
    startTime: startTime || null,
    endTime: endTime || null,
  });

  // here checking the existing session data over the current time or not and setting the state accordingly
  useEffect(() => {
    async function validateExamSessionData() {
      console.log("ExamSessionDate useEffect");
      //  if exam session does not exist, make every field null or undefined
      if (!examSessionData.existingSessionData) {
        console.log("PRO TWO");
        examSessionData.setSessionDate(undefined);
        setStartTime(null);
        setEndTime(null);
        examSessionData.setEnableCopy(false);
      } else if (
        // if exam session exists and session-date is in the past, disable copy button and show error message
        examSessionData?.existingSessionData?.sessionDate?.getDate() <
        new Date().getDate()
      ) {
        console.log("PRO THREE");
        examSessionData.setEnableCopy(false);
        setStartTime(null);
        setEndTime(null);
        examSessionData.setSessionDate(undefined);
        toast.error("Session date is in the past. Please create a new Session");
        deleteExamSession({
          examId: examSessionData.exam._id,
          teacherId: examSessionData.teacher?._id?.toString() || "",
        });
      } else if (
        examSessionData.existingSessionData.sessionDate.getDate() ===
          new Date().getDate() &&
        examSessionData.existingSessionData.startTime &&
        examSessionData.existingSessionData.endTime
      ) {
        // for same date
        const now = new Date();
        const start = new Date(examSessionData.existingSessionData.startTime);
        const end = new Date(examSessionData.existingSessionData.endTime);
        examSessionData.setSessionDate(
          dayjs(examSessionData.existingSessionData?.sessionDate)
        );

        // current time with the start and end time
        if (start < now && now < end) {
          toast.success("Exam Session is Ongoing");
          examSessionData.setEnableCopy(true);
          examSessionData.setSessionDate(
            dayjs(examSessionData.existingSessionData?.sessionDate)
          );
          setStartTime(dayjs(examSessionData.existingSessionData?.startTime));
          setEndTime(dayjs(examSessionData.existingSessionData.endTime));
          return;
        }
        // current time is over the end time
        else if (start < now && now > end) {
          toast.success("Exam Session is Over. Please create a new Session");
          examSessionData.setEnableCopy(false);
          examSessionData.setSessionDate(
            dayjs(examSessionData.existingSessionData?.sessionDate)
          );
          setStartTime(dayjs(examSessionData.existingSessionData?.startTime));
          setEndTime(null);
          deleteExamSession({
            examId: examSessionData.exam._id,
            teacherId: examSessionData.teacher?._id?.toString() || "",
          });
          return;
        } else {
          toast.error("Exam Session hasn't started yet");
          examSessionData.setEnableCopy(true);
          examSessionData.setSessionDate(
            dayjs(examSessionData.existingSessionData?.sessionDate)
          );
          setStartTime(dayjs(examSessionData.existingSessionData?.startTime));
          setEndTime(dayjs(examSessionData.existingSessionData.endTime));
          return;
        }
      } else {
        toast.error("Exam Session hasn't started yet");
        examSessionData.setEnableCopy(true);
        examSessionData.setSessionDate(
          dayjs(examSessionData.existingSessionData?.sessionDate)
        );
        setStartTime(dayjs(examSessionData.existingSessionData?.startTime));
        setEndTime(dayjs(examSessionData.existingSessionData.endTime));
        return;
      }
    }
    if (examSessionData.existingSessionData?._id) {
      console.log("PRO ONE");
      validateExamSessionData();
    }
  }, [examSessionData.existingSessionData]);

  //selecting session Date
  const handleDateSelect = (date: Date | undefined) => {
    examSessionData.setSessionDate(dayjs(date));
    setCalendarOpen(false);
    examSessionData.setEnableCopy(false);
  };

  const handleChangeStartTime = (date: Dayjs | null) => {
    setStartTime(dayjs(date));
    examSessionData.setEnableCopy(false);
  };

  const handleChangeEndTime = (date: Dayjs | null) => {
    setEndTime(dayjs(date));
    examSessionData.setEnableCopy(false);
  };

  //handler to copy Exam Link
  const handleCopyLink = () => {
    if (!examSessionData.sessionDate || !startTime || !endTime) {
      toast.error("Please select date and time first");
      return;
    }
    const examLink = `${window.location.origin}/exam/${examSessionData.teacher?._id}/${examSessionData.exam._id}`;
    navigator.clipboard.writeText(examLink);
    toast.success("Exam link copied to clipboard!");
  };

  //handler to save session
  const handleSessionSave = async () => {
    if (!examSessionData.sessionDate) {
      toast.error("Please select a date first");
      return;
    }

    if (!startTime) {
      toast.error("Please select a start time first");
      return;
    }

    if (!endTime) {
      toast.error("Please select an end time first");
      return;
    }

    if (
      endTime.isBefore(dayjs()) &&
      dayjs().isSame(dayjs(examSessionData.sessionDate))
    ) {
      toast.error("Session end time is in the past.");
      examSessionData.setEnableCopy(false);
      setEndTime(null);
      return;
    } else if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      toast.error("End time should be after Start time");
      examSessionData.setEnableCopy(false);
      setStartTime(dayjs(examSessionData.existingSessionData?.startTime));
      setEndTime(null);
      examSessionData.setSessionDate(
        dayjs(examSessionData.existingSessionData?.sessionDate)
      );
      deleteExamSession({
        examId: examSessionData.exam._id,
        teacherId: examSessionData.teacher?._id?.toString() || "",
      });
      return;
    }

    try {
      const res = await addExamSession({
        teacherId: examSessionData.teacher?._id?.toString() || "",
        examId: examSessionData.exam._id,
        sessionDate: examSessionData.sessionDate.toDate(),
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }
      examSessionData.setEnableCopy(true);

      setExamSession({
        examDate: examSessionData.sessionDate,
        startTime: startTime,
        endTime: endTime,
      });

      toast.success("Session added successfully");
    } catch (error) {
      toast.error("Error adding session");
      console.error(error);
    }
  };
  //handler to reset session
  const handleClickReset = async () => {
    try {
      const res = await deleteExamSession({
        teacherId: examSessionData.teacher?._id?.toString() || "",
        examId: examSessionData.exam._id,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Session deleted successfully");
      setStartTime(null);
      setEndTime(null);
      examSessionData.setSessionDate(undefined);
      examSessionData.setEnableCopy(false);
    } catch (error) {
      console.error(error);
      toast.error("Error resetting session");
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          {examSessionData.basicExamDetails.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {examSessionData.basicExamDetails.description}
        </p>
        <p className="text-sm text-muted-foreground">
          Duration:{" "}
          <span className="font-medium text-foreground">
            {examSessionData.basicExamDetails.duration} mins
          </span>
        </p>
      </div>

      {/* Selected Date Display */}
      {examSessionData.sessionDate && (
        <div className="bg-muted rounded-md p-3 flex flex-col gap-1">
          <span className="text-sm font-semibold text-primary">
            Selected Date:{" "}
            <span className=" text-secondary-foreground">
              {examSessionData.sessionDate
                .toDate()
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </span>
          </span>
          <span className="text-sm font-semibold text-primary">
            Selected Start Time:{" "}
            <span className=" text-secondary-foreground">
              {startTime ? dayjs(startTime).format("hh:mm A") : "Not selected"}
            </span>
          </span>
          <span className="text-sm font-semibold text-primary">
            Selected End Time:{" "}
            <span className="text-secondary-foreground">
              {endTime?.isBefore(dayjs()) &&
              dayjs().isSame(dayjs(examSessionData.sessionDate)) ? (
                <span className=" text-red-500">End time is in the past</span>
              ) : endTime ? (
                dayjs(endTime).format("hh:mm A")
              ) : (
                "Not selected"
              )}
            </span>
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
              {examSessionData.sessionDate ? (
                examSessionData.sessionDate.format("MMMM D, YYYY") // or use .format("MMMM D, YYYY") for full date
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}

              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={examSessionData.sessionDate?.toDate()}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
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
            onChange: handleChangeStartTime,
          }}
        />
        <BasicTimePicker
          data={{
            label: "End Time",
            value: endTime,
            onChange: handleChangeEndTime,
          }}
        />
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
        Please select the exam date and time to publish the exam schedule.{" "}
        <span className="  text-red-400/85">
          Click Save Chnages to save and Copy.
        </span>
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
          disabled={!examSessionData.enableCopy}
          className="flex-1"
        >
          Copy Exam Link
        </Button>
      </div>
    </div>
  );
};
