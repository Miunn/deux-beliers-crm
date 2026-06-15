"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "../ui/data-table";
import { contactActions, useContacts } from "@/stores/contacts-store";
import { ContactWithRelations } from "@/types/contact-types";
import EventDialog from "../dialogs/EventDialog";
import ContactDialog from "../dialogs/ContactDialog";
import { Button } from "../ui/button";

export default function ContactTable({ data }: { data?: ContactWithRelations[] }) {
	const initialized = useRef(false);
	const [eventContact, setEventContact] = useState<ContactWithRelations | null>(null);
	const [eventOpen, setEventOpen] = useState(false);

	if (!initialized.current) {
		contactActions.setContacts(data ?? []);
		initialized.current = true;
	}

	useEffect(() => {
		contactActions.setContacts(data ?? []);
	}, [data]);

	const contacts = useContacts();

	return (
		<>
			<DataTable
				columns={columns}
				data={contacts}
				initialSorting={[{ id: "rappel", desc: false }]}
				showReminderWithinSevenDaysFilter
				showEventDateRangeFilter
				showLabelsFilter
				onRowClick={(contact) => {
					setEventContact(contact);
					setEventOpen(true);
				}}
				toolbarTrailing={
					<ContactDialog mode="create">
						<Button variant="outline">
							<Plus className="size-4 mr-2" />
							Nouveau
						</Button>
					</ContactDialog>
				}
			/>
			{eventContact ? (
				<EventDialog
					contact={eventContact}
					open={eventOpen}
					onOpenChange={(open) => {
						setEventOpen(open);
						if (!open) setEventContact(null);
					}}
				/>
			) : null}
		</>
	);
}
