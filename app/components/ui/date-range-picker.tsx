"use client";

import * as React from "react";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, addMonths, isToday } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { DayPicker, DayProps } from "react-day-picker";
import { Day as DefaultDay } from "react-day-picker";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [secondMonth, setSecondMonth] = React.useState<Date>(
    addMonths(new Date(), 1)
  );

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => currentYear - 25 + i);
  }, []);

  const handleMonthChange = (date: Date, isFirstMonth: boolean) => {
    if (isFirstMonth) {
      setMonth(date);
    } else {
      setSecondMonth(date);
    }
  };

  const MonthYearHeader = ({
    date,
    onMonthChange,
  }: {
    date: Date;
    onMonthChange: (date: Date) => void;
  }) => {
    const year = date.getFullYear();
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-t-lg bg-muted/70 shadow-sm mb-2 transition-colors">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-accent/60"
          onClick={() => onMonthChange(addMonths(date, -1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold select-none transition-colors">
            {format(date, "MMMM")}
          </span>
          <Select
            value={year.toString()}
            onValueChange={(value) => {
              const newDate = new Date(date);
              newDate.setFullYear(parseInt(value));
              onMonthChange(newDate);
            }}
          >
            <SelectTrigger className="h-8 w-[80px] text-sm border-none bg-transparent hover:bg-accent/50 focus:ring-0 font-semibold">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-sm">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-accent/60"
          onClick={() => onMonthChange(addMonths(date, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  // Hide default calendar caption
  const EmptyCaption = () => <></>;

  // Sync months with value
  React.useEffect(() => {
    if (value?.from) {
      setMonth(value.from);
      setSecondMonth(value.to ? value.to : addMonths(value.from, 1));
    }
  }, [value?.from, value?.to]);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-6 rounded-2xl shadow-2xl bg-background"
          align="start"
        >
          <div className="flex gap-8">
            <div className="rounded-xl border bg-card shadow-sm p-2">
              <MonthYearHeader
                date={month}
                onMonthChange={(date) => handleMonthChange(date, true)}
              />
              <Calendar
                initialFocus
                mode="range"
                month={month}
                onMonthChange={(date) => handleMonthChange(date, true)}
                selected={value}
                onSelect={onChange}
                numberOfMonths={1}
                className="rounded-lg"
                components={{ Caption: EmptyCaption }}
                modifiersClassNames={{
                  today:
                    "bg-primary/10 text-primary font-bold w-8 h-8 flex items-center justify-center rounded-full",
                }}
              />
            </div>
            <div className="flex items-stretch mx-2">
              <div className="w-px bg-border" />
            </div>
            <div className="rounded-xl border bg-card shadow-sm p-2">
              <MonthYearHeader
                date={secondMonth}
                onMonthChange={(date) => handleMonthChange(date, false)}
              />
              <Calendar
                mode="range"
                month={secondMonth}
                onMonthChange={(date) => handleMonthChange(date, false)}
                selected={value}
                onSelect={onChange}
                numberOfMonths={1}
                className="rounded-lg"
                components={{ Caption: EmptyCaption }}
                modifiersClassNames={{
                  today:
                    "bg-primary/10 text-primary font-bold w-8 h-8 flex items-center justify-center rounded-full",
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => onChange?.(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
