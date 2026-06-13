import { useSyncExternalStore } from "react";
import { Label } from "../../generated/prisma";
import { ContactWithRelations } from "@/types/contact-types";

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

export const contactActions = {
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

	appendEventDate(contactId: string, date: Date | string) {
		contacts = contacts.map((c) =>
			c.id === contactId
				? {
						...c,
						events: [
							{
								id: `temp-${Date.now()}`,
								date,
								nature: null,
								commentaires: null,
							},
							...(c.events ?? []),
						],
					}
				: c,
		);
		emit();
	},
};
