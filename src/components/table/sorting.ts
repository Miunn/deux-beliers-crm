import { ContactWithRelations } from "@/types/contact-types";

export function getLastEvent(contact: ContactWithRelations) {
	if (!contact.events?.length) return null;
	return contact.events.reduce((latest, event) => {
		const eventDate = new Date(event.date);
		return eventDate > new Date(latest.date) ? event : latest;
	}, contact.events[0]);
}

export function compareRappelRows(
	a: ContactWithRelations,
	b: ContactWithRelations,
): number {
	const aValue = a.rappel ? new Date(a.rappel).getTime() : undefined;
	const bValue = b.rappel ? new Date(b.rappel).getTime() : undefined;

	if (aValue === undefined && bValue === undefined) return 0;
	if (aValue === undefined) return 1;
	if (bValue === undefined) return -1;

	return aValue - bValue;
}
