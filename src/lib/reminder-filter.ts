export type ReminderFilter = "all" | "within7d" | "overdue" | "none";

export function parseReminderFilterParam(value: string | null): ReminderFilter | null {
	switch (value) {
		case "7d":
			return "within7d";
		case "overdue":
			return "overdue";
		case "none":
			return "none";
		default:
			return null;
	}
}

export function reminderFilterToParam(filter: ReminderFilter): string | null {
	switch (filter) {
		case "within7d":
			return "7d";
		case "overdue":
			return "overdue";
		case "none":
			return "none";
		default:
			return null;
	}
}

export function startOfToday(): Date {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

export function inSevenDaysFromNow(): Date {
	const date = new Date();
	date.setDate(date.getDate() + 7);
	date.setHours(23, 59, 59, 999);
	return date;
}
