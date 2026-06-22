"use client";

import { useLabels } from "@/hooks/use-labels";
import { Input } from "../ui/input";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import RangeCalendarPresets from "../ui/range-calendar-presets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MultiSelect } from "../ui/multi-select";
import { useContactFilters } from "@/context/ContactFiltersContext";
import { Checkbox } from "../ui/checkbox";
import { parseLabelIdUrlParam, resolveLabelTokensToSelectedStates } from "@/lib/label-filter-url";
import { parseReminderFilterParam } from "@/lib/reminder-filter";
import SortByDropdown from "./SortByDropdown";

export default function ContactFilters() {
  const { data: labels } = useLabels();
  const searchParams = useSearchParams();
  const {
    text,
    setText,
    reminderFilter,
    setReminderFilter,
    selectedLabels,
    setSelectedLabels,
    dateRange,
    setDateRange,
    resetFilters,
    sortState,
    setSortState,
  } = useContactFilters();

  // local debounced text input state
  const [localText, setLocalText] = useState<string>(text ?? "");
  const labelUrlHydratedRef = useRef(false);

  // keep local input in sync if external text changes (e.g., reset)
  useEffect(() => {
    setLocalText(text ?? "");
  }, [text]);

  // debounce pushing local text to context filter
  useEffect(() => {
    const t = setTimeout(() => {
      setText(localText);
    }, 250);
    return () => clearTimeout(t);
  }, [localText, setText]);

  // one-time initial hydration from URL params (q, reminder)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlReminder = parseReminderFilterParam(searchParams.get("reminder"));
    if (urlQ && !text) {
      setText(urlQ);
      setLocalText(urlQ);
    }
    if (urlReminder && reminderFilter === "all") setReminderFilter(urlReminder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (labelUrlHydratedRef.current || selectedLabels.length > 0) return;

    const tokens = parseLabelIdUrlParam(searchParams.get("labelId"));
    if (!tokens.length) {
      labelUrlHydratedRef.current = true;
      return;
    }

    if (!labels?.length) return;

    const resolved = resolveLabelTokensToSelectedStates(tokens, labels);
    if (resolved.length) setSelectedLabels(resolved);
    labelUrlHydratedRef.current = true;
  }, [labels, searchParams, selectedLabels.length, setSelectedLabels]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Effacer les filtres"
        onClick={() => {
          resetFilters();
          setLocalText("");
        }}
      >
        <XIcon size={16} />
      </Button>
      <div className="relative">
        <Input
          id={`search-input`}
          className="peer ps-9"
          placeholder={`Rechercher`}
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
      <Button
        variant={"outline"}
        onClick={() => setReminderFilter(reminderFilter === "within7d" ? "all" : "within7d")}
        className="cursor-default"
        asChild
      >
        <div>
          <Checkbox
            checked={reminderFilter === "within7d"}
            onCheckedChange={(checked) => setReminderFilter(checked ? "within7d" : "all")}
          />
          Rappel dans les 7 jours
        </div>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal min-w-56"
          >
            {dateRange?.from
              ? dateRange.from.toLocaleDateString() +
                "-" +
                dateRange.to?.toLocaleDateString()
              : "Date d'évènement"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <RangeCalendarPresets date={dateRange} setDate={setDateRange} />
        </PopoverContent>
      </Popover>
      <MultiSelect
        maxCount={2}
        autoSize
        options={
          labels?.map((label) => ({
            label: label.label,
            value: label.id,
            icon: () => (
              <div
                key={label.id}
                className="size-4 rounded-md"
                style={{ backgroundColor: label.color }}
              />
            ),
          })) ?? []
        }
        placeholder="Libellés"
        onValueChange={setSelectedLabels}
        defaultValue={selectedLabels}
      />
      <SortByDropdown sortState={sortState} setSortState={setSortState} />
    </>
  );
}
