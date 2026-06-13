"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ContactFiltersProvider } from "@/context/ContactFiltersContext";
import { contactActions } from "@/stores/contacts-store";
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
		contactActions.setContacts(defaultContacts);
		initialized.current = true;
	}

	useEffect(() => {
		contactActions.setContacts(defaultContacts);
	}, [defaultContacts]);

	return <ContactFiltersProvider>{children}</ContactFiltersProvider>;
}
