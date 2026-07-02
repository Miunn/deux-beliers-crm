import { useSyncExternalStore } from "react";
import { Label } from "../../generated/prisma";
import { ContactEventLite, ContactWithRelations } from "@/types/contact-types";

type SyncContactEventInput = {
	date: Date | string;
	commentaires?: string | null;
	nature?: ContactEventLite["nature"];
};

type SyncContactEventOptions = {
	updateEventId?: string;
	rappel?: Date | null;
};

type Listener = () => void;

let contacts: ContactWithRelations[] = [];
const listeners = new Set<Listener>();

function emit() {
	listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return contacts;
}

export function useContacts() {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const contactStore = {
	setContacts(next: ContactWithRelations[]) {
		contacts = next;
		emit();
	},

	addOrUpdateContact(contact: Partial<ContactWithRelations> | ContactWithRelations) {
		const index = contacts.findIndex((c) => c.id === contact.id);
		if (index === -1) {
			if (
				!("nom" in contact) ||
				!("labels" in contact) ||
				!("activite" in contact) ||
				!("events" in contact)
			) {
				console.log("Cannot add contact, missing required fields:", contact);
				return;
			}
			contacts = [...contacts, contact as ContactWithRelations];
		} else {
			const next = contacts.slice();
			next[index] = { ...contacts[index], ...contact } as ContactWithRelations;
			contacts = next;
		}
		emit();
	},

	removeContact(id: string) {
		contacts = contacts.filter((c) => c.id !== id);
		emit();
	},

	setContactLabels(id: string, labels: Label[]) {
		contacts = contacts.map((c) => (c.id === id ? { ...c, labels } : c));
		emit();
	},

	syncContactEvent(contactId: string, event: SyncContactEventInput, options?: SyncContactEventOptions) {
		contacts = contacts.map((c) => {
			if (c.id !== contactId) return c;

			const eventEntry: ContactEventLite = {
				id: options?.updateEventId ?? `temp-${Date.now()}`,
				date: event.date,
				commentaires: event.commentaires ?? null,
				nature: event.nature ?? null,
			};

			const events =
				options?.updateEventId && c.events?.some((existing) => existing.id === options.updateEventId)
					? c.events.map((existing) =>
							existing.id === options.updateEventId ? eventEntry : existing,
						)
					: [eventEntry, ...(c.events ?? [])];

			return {
				...c,
				events,
				...(options?.rappel !== undefined ? { rappel: options.rappel } : {}),
			};
		});
		emit();
	},
};
