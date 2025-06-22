"use client";
import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";

type BasicTimePickerProps = {
  label?: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
};

export default function BasicTimePicker({
  data,
}: {
  data: BasicTimePickerProps;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["TimePicker"]}>
        <TimePicker
          label={data.label}
          value={data.value}
          onChange={data.onChange}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
