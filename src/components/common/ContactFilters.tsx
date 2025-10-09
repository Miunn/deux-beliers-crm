import { useLabels } from "@/hooks/use-labels";
import { Input } from "../ui/input";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import RangeCalendarPresets from "../ui/range-calendar-presets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { DateRange } from "react-day-picker";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MultiSelect } from "../ui/multi-select";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export default function ContactFilters() {
  const { data: labels } = useLabels();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    searchParams.get("labelId")?.split(",") ?? []
  );
  const [text, setText] = useState<string>(searchParams.get("q") ?? "");

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const initialRange = useMemo(() => {
    try {
      const from = fromParam ? new Date(fromParam) : undefined;
      const to = toParam ? new Date(toParam) : undefined;
      return from || to ? { from, to } : undefined;
    } catch {
      return undefined;
    }
  }, [fromParam, toParam]);

  useEffect(() => {
    // Initialize date range from URL once on mount if present
    if (initialRange && !dateRange) {
      setDateRange(initialRange as DateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // q
    if (text && text.trim().length > 0) params.set("q", text.trim());
    else params.delete("q");

    // labels
    const labelJoined = selectedLabelIds.filter(Boolean).join(",");
    if (labelJoined) params.set("labelId", labelJoined);
    else params.delete("labelId");

    // dates
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    else params.delete("from");
    if (dateRange?.to) params.set("to", dateRange.to.toISOString());
    else params.delete("to");

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next);
  }, [text, selectedLabelIds, dateRange, router, pathname, searchParams]);

  return (
    <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-stretch gap-2">
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal min-w-60"
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
            icon: () => (
              <div
                key={label.id}
                className="size-4 rounded-md"
                style={{ backgroundColor: label.color }}
              />
            ),
          })) ?? []
        }
        onValueChange={setSelectedLabelIds}
        defaultValue={selectedLabelIds}
      />
    </div>
  );
}
