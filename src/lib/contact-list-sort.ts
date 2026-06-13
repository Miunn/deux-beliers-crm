import { ContactSortMethod, ContactWithRelations } from "@/types/contact-types";

export function compareContactsForList(
	a: ContactWithRelations,
	b: ContactWithRelations,
	sortState: ContactSortMethod,
): number {
	switch (sortState) {
		case ContactSortMethod.NameAsc:
			return (a.nom ?? "").localeCompare(b.nom ?? "", "fr", { sensitivity: "base" });
		case ContactSortMethod.NameDesc:
			return (b.nom ?? "").localeCompare(a.nom ?? "", "fr", { sensitivity: "base" });
		case ContactSortMethod.RappelAsc: {
			const dateA = a.rappel ? new Date(a.rappel).getTime() : Infinity;
			const dateB = b.rappel ? new Date(b.rappel).getTime() : Infinity;
			return dateA - dateB;
		}
		case ContactSortMethod.RappelDesc: {
			const dateA = a.rappel ? new Date(a.rappel).getTime() : -Infinity;
			const dateB = b.rappel ? new Date(b.rappel).getTime() : -Infinity;
			return dateB - dateA;
		}
		default:
			return 0;
	}
}
