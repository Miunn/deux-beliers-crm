import { useLabels } from "@/hooks/use-labels";
import { Input } from "../ui/input";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import RangeCalendarPresets from "../ui/range-calendar-presets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
// import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MultiSelect } from "../ui/multi-select";
import { useContactsContext } from "../../context/ContactsContext";
import { Checkbox } from "../ui/checkbox";
import SortByDropdown from "./SortByDropdown";

export default function ContactFilters() {
  const { data: labels } = useLabels();
  const searchParams = useSearchParams();
  const {
    text,
    setText,
    hasReminder,
    setHasReminder,
    selectedLabelIds,
    setSelectedLabelIds,
    dateRange,
    setDateRange,
    resetFilters,
    sortState,
    setSortState,
  } = useContactsContext();

  // local debounced text input state
  const [localText, setLocalText] = useState<string>(text ?? "");

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

  // one-time initial hydration from URL params (q, labelId)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlLabelIds = searchParams.get("labelId")?.split(",") ?? [];
    if (urlQ && !text) {
      setText(urlQ);
      setLocalText(urlQ);
    }
    if (urlLabelIds.length && selectedLabelIds.length === 0)
      setSelectedLabelIds(urlLabelIds.filter(Boolean));
    // dates are not encoded currently in URL in this component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <Button variant={"outline"} onClick={() => setHasReminder(!hasReminder)}>
        <Checkbox
          checked={hasReminder}
          onCheckedChange={(checked) => setHasReminder(checked as boolean)}
        />
        Rappel dans les 7 jours
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
        onValueChange={setSelectedLabelIds}
        defaultValue={selectedLabelIds}
      />
      <SortByDropdown sortState={sortState} setSortState={setSortState} />
    </>
  );
}
