import { subMonths } from "date-fns";
import { ContactWithRelations } from "@/types/contact-types";

export function getLastEvent(contact: ContactWithRelations) {
	if (!contact.events?.length) return null;
	return contact.events.reduce((latest, event) => {
		const eventDate = new Date(event.date);
		return eventDate > new Date(latest.date) ? event : latest;
	}, contact.events[0]);
}

function getRappelTier(contact: ContactWithRelations, threeMonthsAgo: Date) {
	if (!contact.rappel) return 1;
	const date = new Date(contact.rappel);
	if (date < threeMonthsAgo) return 2;
	return 0;
}

export function compareRappelRows(
	a: ContactWithRelations,
	b: ContactWithRelations,
): number {
	const threeMonthsAgo = subMonths(new Date(), 3);
	const tierA = getRappelTier(a, threeMonthsAgo);
	const tierB = getRappelTier(b, threeMonthsAgo);

	if (tierA !== tierB) return tierA - tierB;

	const dateA = a.rappel ? new Date(a.rappel).getTime() : Infinity;
	const dateB = b.rappel ? new Date(b.rappel).getTime() : Infinity;

	if (tierA === 1) return 0;

	if (tierA === 2) {
		return dateB - dateA;
	}

	return dateA - dateB;
}
