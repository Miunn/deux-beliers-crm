"use client";

import { useState } from "react";
import { addWeeks, startOfMonth, startOfWeek, startOfYear } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function CalendarPresets({
  date,
  setDate,
  className,
  calendarProps,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  className?: string;
  calendarProps?: React.ComponentProps<typeof Calendar>;
}) {
  const today = new Date();
  const nextWeek: Date = startOfWeek(addWeeks(today, 1));
  const sevenDays = addWeeks(today, 1);
  const nextMonth = startOfMonth(addWeeks(today, 4));
  const oneMonth = addWeeks(today, 4);
  const nextYear = startOfYear(addWeeks(today, 52));
  const oneYear = addWeeks(today, 52);

  const [month, setMonth] = useState(today);

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="flex max-sm:flex-col gap-4">
        <div className="relative max-sm:order-1 max-sm:border-t">
          <div className="h-full sm:border-e">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(nextWeek);
                  setMonth(nextWeek);
                }}
              >
                Semaine prochaine
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(sevenDays);
                  setMonth(sevenDays);
                }}
              >
                Dans 7 jours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(nextMonth);
                  setMonth(nextMonth);
                }}
              >
                Mois prochain
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(oneMonth);
                  setMonth(oneMonth);
                }}
              >
                Dans un mois
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(nextYear);
                  setMonth(nextYear);
                }}
              >
                Année prochaine
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(oneYear);
                  setMonth(oneYear);
                }}
              >
                Dans un an
              </Button>
            </div>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="p-2"
          disabled={calendarProps?.disabled}
        />
      </div>
    </div>
  );
}
