"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "../ui/data-table";
import { contactStore, useContacts } from "@/stores/contacts-store";
import { ContactWithRelations } from "@/types/contact-types";
import EventDialog from "../dialogs/EventDialog";
import ContactDialog from "../dialogs/ContactDialog";
import { Button } from "../ui/button";

export default function ContactTable({ data }: { data?: ContactWithRelations[] }) {
	const initialized = useRef(false);
	const [dialogContact, setDialogContact] = useState<ContactWithRelations | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [eventOpen, setEventOpen] = useState(false);

	useEffect(() => {
		if (!editOpen && !eventOpen) {
			setDialogContact(null);
		}
	}, [editOpen, eventOpen]);

	if (!initialized.current) {
		contactStore.setContacts(data ?? []);
		initialized.current = true;
	}

	useEffect(() => {
		contactStore.setContacts(data ?? []);
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
					setDialogContact(contact);
					setEditOpen(false);
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
			{dialogContact ? (
				<>
					<ContactDialog
						mode="edit"
						contact={dialogContact}
						open={editOpen}
						onOpenChange={setEditOpen}
						onNavigateToEvents={() => {
							setEditOpen(false);
							setEventOpen(true);
						}}
					/>
					<EventDialog
						contact={dialogContact}
						open={eventOpen}
						onOpenChange={setEventOpen}
						onNavigateToContact={() => {
							setEventOpen(false);
							setEditOpen(true);
						}}
					/>
				</>
			) : null}
		</>
	);
}
