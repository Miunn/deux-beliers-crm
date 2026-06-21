import { DateRange } from "react-day-picker";
import { SelectedState } from "@/components/ui/multi-select";
import { ContactWithRelations } from "@/types/contact-types";

export const RAPPEL_WITHIN_SEVEN_DAYS_FILTER = "within7Days";

export function contactMatchesSelectedLabels(
	contact: ContactWithRelations,
	selectedLabels: SelectedState[] | undefined,
): boolean {
	if (!selectedLabels?.length) return true;

	const labelIds = new Set(contact.labels.map((label) => label.id));
	const excludeLabels = selectedLabels.filter((label) => label.action === "exclude");
	for (const label of excludeLabels) {
		if (labelIds.has(label.id)) return false;
	}

	const andLabels = selectedLabels.filter((label) => label.action === "and");
	for (const label of andLabels) {
		if (!labelIds.has(label.id)) return false;
	}

	const orLabels = selectedLabels.filter((label) => label.action === "or");
	if (orLabels.length > 0 && !orLabels.some((label) => labelIds.has(label.id))) {
		return false;
	}

	return true;
}

export function contactHasEventInDateRange(
	contact: ContactWithRelations,
	range: DateRange | undefined,
): boolean {
	if (!range?.from && !range?.to) return true;

	const events = contact.events ?? [];
	return events.some((event) => {
		const date = event?.date ? new Date(event.date) : undefined;
		if (!date) return false;
		if (range.from && date < range.from) return false;
		if (range.to && date > range.to) return false;
		return true;
	});
}
