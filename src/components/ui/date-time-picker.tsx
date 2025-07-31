"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  label?: string;
}

export function DateTimePicker({ date, setDate, label }: DateTimePickerProps) {
  // Split the date and time for separate handling
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    const updatedDate = new Date(date);
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());

    setDate(updatedDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return;

    const updatedDate = new Date(date);
    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);

    setDate(updatedDate);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Selecione a data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <Input
            type="time"
            value={format(date, "HH:mm")}
            onChange={handleTimeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
