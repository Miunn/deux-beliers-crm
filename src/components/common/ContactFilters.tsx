import { useLabels } from "@/hooks/use-labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import RangeCalendarPresets from "../ui/range-calendar-presets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ContactFilters() {
  const { data: labels } = useLabels();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [labelId, setLabelId] = useState<string | undefined>(
    searchParams.get("labelId") ?? undefined
  );
  const [text, setText] = useState<string>(searchParams.get("q") ?? "");

  useEffect(() => {
    const h = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (text.trim()) params.set("q", text.trim());
      else params.delete("q");
      if (labelId) params.set("labelId", labelId);
      else params.delete("labelId");
      if (dateRange?.from) params.set("from", dateRange.from.toISOString());
      else params.delete("from");
      if (dateRange?.to) params.set("to", dateRange.to.toISOString());
      else params.delete("to");
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    }, 300);
    return () => clearTimeout(h);
  }, [text, labelId, dateRange, router, searchParams]);
  return (
    <>
      <div className="*:not-first:mt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Effacer les filtres"
            onClick={() => {
              setText("");
              setLabelId("all");
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
            className="w-60 justify-between font-normal"
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
      <Select value={labelId} onValueChange={(v) => setLabelId(v)}>
        <SelectTrigger className="min-w-32">
          <SelectValue placeholder="Libellé" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"all"}>Tous</SelectItem>
          {labels?.map((label) => (
            <SelectItem key={label.id} value={label.id}>
              {label.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
