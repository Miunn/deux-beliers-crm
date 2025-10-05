"use client";

import { useState } from "react";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export default function RangeCalendarPresets({
  date,
  setDate,
}: {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
  const today = new Date();
  const last7Days = {
    from: subDays(today, 6),
    to: today,
  };
  const last30Days = {
    from: subDays(today, 29),
    to: today,
  };
  const monthToDate = {
    from: startOfMonth(today),
    to: today,
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const yearToDate = {
    from: startOfYear(today),
    to: today,
  };
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };
  const [month, setMonth] = useState(today);

  return (
    <div className="rounded-md border">
      <div className="flex max-sm:flex-col gap-4">
        <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
          <div className="h-full sm:border-e">
            <div className="flex flex-col px-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(last7Days);
                  setMonth(last7Days.to);
                }}
              >
                Derniers 7 jours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(last30Days);
                  setMonth(last30Days.to);
                }}
              >
                Derniers 30 jours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(monthToDate);
                  setMonth(monthToDate.to);
                }}
              >
                Mois à date
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(lastMonth);
                  setMonth(lastMonth.to);
                }}
              >
                Dernier mois
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(yearToDate);
                  setMonth(yearToDate.to);
                }}
              >
                Année à date
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setDate(lastYear);
                  setMonth(lastYear.to);
                }}
              >
                Dernière année
              </Button>
            </div>
          </div>
        </div>
        <Calendar
          mode="range"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="p-2"
        />
      </div>
    </div>
  );
}
