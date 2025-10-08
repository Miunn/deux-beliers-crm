import { useLabels } from "@/hooks/use-labels";
import { Input } from "../ui/input";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import RangeCalendarPresets from "../ui/range-calendar-presets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MultiSelect } from "../ui/multi-select";

export default function ContactFilters() {
  const { data: labels } = useLabels();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    searchParams.get("labelId")?.split(",") ?? []
  );
  const [text, setText] = useState<string>(searchParams.get("q") ?? "");

  return (
    <div className="grid grid-cols-3 items-stretch gap-2">
      <div className="*:not-first:mt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Effacer les filtres"
            onClick={() => {
              setText("");
              setSelectedLabelIds([]);
              setDateRange(undefined);
            }}
          >
            <XIcon size={16} />
          </Button>
          <div className="relative flex-1">
            <Input
              id={`search-input`}
              className="peer ps-9"
              placeholder={`Rechercher`}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal"
          >
            {dateRange?.from
              ? dateRange.from.toLocaleDateString() +
                "-" +
                dateRange.to?.toLocaleDateString()
              : "Sélectionner une date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <RangeCalendarPresets date={dateRange} setDate={setDateRange} />
        </PopoverContent>
      </Popover>
      <MultiSelect
        options={
          labels?.map((label) => ({
            label: label.label,
            value: label.id,
          })) ?? []
        }
        onValueChange={setSelectedLabelIds}
        defaultValue={selectedLabelIds}
      />
    </div>
  );
}
