"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ContactFiltersProvider } from "@/context/ContactFiltersContext";
import { contactStore } from "@/stores/contacts-store";
import { ContactWithRelations } from "@/types/contact-types";

export default function ContactsShell({
	defaultContacts,
	children,
}: {
	defaultContacts: ContactWithRelations[];
	children: ReactNode;
}) {
	const initialized = useRef(false);
	if (!initialized.current) {
		contactStore.setContacts(defaultContacts);
		initialized.current = true;
	}

	useEffect(() => {
		contactStore.setContacts(defaultContacts);
	}, [defaultContacts]);

	return <ContactFiltersProvider>{children}</ContactFiltersProvider>;
}
