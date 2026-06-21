"use client";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

type Props = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export default function ReminderWithinSevenDaysFilter({ checked, onCheckedChange }: Props) {
	return (
		<Button variant="outline" onClick={() => onCheckedChange(!checked)} className="cursor-default" asChild>
			<div>
				<Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
				Rappel dans les 7 jours
			</div>
		</Button>
	);
}
