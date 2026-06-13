import { Activite, Contact, Label } from "../../generated/prisma";

export type ContactEventLite = {
	id: string;
	date: Date | string;
	nature?: { id: string; label: string } | null;
	commentaires?: string | null;
};

export type ContactWithRelations = Contact & {
	labels: Label[];
	activite: Activite | null;
	events?: ContactEventLite[];
	kanbanColumn: { id: string; name: string; color: string } | null;
};

export enum ContactSortMethod {
	NameAsc = "NAME_ASC",
	NameDesc = "NAME_DESC",
	RappelAsc = "RAPPEL_ASC",
	RappelDesc = "RAPPEL_DESC",
}
