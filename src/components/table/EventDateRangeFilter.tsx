"use client";

import { Dispatch, SetStateAction } from "react";
import { ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import RangeCalendarPresets from "../ui/range-calendar-presets";

type Props = {
	value: DateRange | undefined;
	onChange: Dispatch<SetStateAction<DateRange | undefined>>;
};

export default function EventDateRangeFilter({ value, onChange }: Props) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="justify-between font-normal min-w-56">
					{value?.from
						? `${value.from.toLocaleDateString()}-${value.to?.toLocaleDateString() ?? ""}`
						: "Date d'évènement"}
					<ChevronDownIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden p-0" align="end">
				<RangeCalendarPresets date={value} setDate={onChange} />
			</PopoverContent>
		</Popover>
	);
}
