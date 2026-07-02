import { useMemo } from "react";
import { useContactFilters } from "@/context/ContactFiltersContext";
import { filterContacts } from "@/lib/contact-filters";
import { compareContactsForList } from "@/lib/contact-list-sort";
import { useContacts } from "@/stores/contacts-store";

export function useDerivedContacts() {
	const allContacts = useContacts();
	const { text, reminderFilter, selectedLabels, dateRange, sortState } =
		useContactFilters();

	const filteredContacts = useMemo(
		() =>
			filterContacts(allContacts, {
				text,
				reminderFilter,
				selectedLabels,
				dateRange,
			}),
		[allContacts, text, reminderFilter, selectedLabels, dateRange],
	);

	const contacts = useMemo(() => {
		if (!filteredContacts.length) return filteredContacts;
		return [...filteredContacts].sort((a, b) =>
			compareContactsForList(a, b, sortState),
		);
	}, [filteredContacts, sortState]);

	return { filteredContacts, contacts };
}
