import { DateRange } from "react-day-picker";
import { SelectedState } from "@/components/ui/multi-select";
import { contactMatchesSelectedLabels } from "@/components/table/column-filters";
import { ReminderFilter, inSevenDaysFromNow, startOfToday } from "@/lib/reminder-filter";
import { ContactWithRelations } from "@/types/contact-types";

export type ContactFiltersState = {
	text: string;
	reminderFilter: ReminderFilter;
	selectedLabels: SelectedState[];
	dateRange: DateRange | undefined;
};

export function filterContacts(
	items: ContactWithRelations[],
	{ text, reminderFilter, selectedLabels, dateRange }: ContactFiltersState,
): ContactWithRelations[] {
	if (!items.length) return items;

	const q = text.trim().toLowerCase();
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;

	return items.filter((c) => {
		if (reminderFilter === "within7d") {
			if (!c.rappel) return false;
			if (new Date(c.rappel) > inSevenDaysFromNow()) return false;
		}

		if (reminderFilter === "overdue") {
			if (!c.rappel) return false;
			if (new Date(c.rappel) >= startOfToday()) return false;
		}

		if (reminderFilter === "none") {
			if (c.rappel) return false;
		}

		if (selectedLabels.length > 0) {
			if (!contactMatchesSelectedLabels(c, selectedLabels)) return false;
		}

		if (fromDate || toDate) {
			const events = c.events ?? [];
			if (
				!events.some((e) => {
					const d = e?.date ? new Date(e.date) : undefined;
					if (!d) return false;
					if (fromDate && d < fromDate) return false;
					if (toDate && d > toDate) return false;
					return true;
				})
			) {
				return false;
			}
		}

		if (q) {
			const haystacks: string[] = [
				c.nom ?? "",
				c.ville ?? "",
				c.contact ?? "",
				c.telephone ?? "",
				c.mail ?? "",
				c.observations ?? "",
				String(c.adresse ?? ""),
				String(c.horaires ?? ""),
				c.activite?.label ?? "",
				...c.labels.map((l) => l.label ?? ""),
			];
			const eventStrings: string[] = c.events
				? c.events.flatMap((e) => [e?.nature?.label ?? "", e?.commentaires ?? ""])
				: [];
			const all = haystacks.concat(eventStrings).join("\n").toLowerCase();
			if (!all.includes(q)) return false;
		}

		return true;
	});
}
