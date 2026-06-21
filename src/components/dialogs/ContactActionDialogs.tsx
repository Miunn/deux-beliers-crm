"use client";

import { useState } from "react";
import { Calendar, Pen, Trash } from "lucide-react";
import { ContactWithRelations } from "@/types/contact-types";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ContactDialog from "./ContactDialog";
import DeleteContact from "./DeleteContact";
import EventDialog from "./EventDialog";
import { cn } from "@/lib/utils";

type ContactActionDialogsProps = {
	contact: ContactWithRelations;
	layout?: "table" | "inline";
};

export default function ContactActionDialogs({ contact, layout = "table" }: ContactActionDialogsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [eventsOpen, setEventsOpen] = useState(false);

	const openEdit = () => {
		setEventsOpen(false);
		setEditOpen(true);
	};

	const openEvents = () => {
		setEditOpen(false);
		setEventsOpen(true);
	};

	const editButton = (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className={cn(layout === "table" && "size-8")}
			title="Modifier le contact"
			onClick={openEdit}
		>
			<Pen className={layout === "table" ? "size-4" : undefined} />
		</Button>
	);

	const eventsButton = (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className={cn(layout === "table" && "size-8")}
			title="Événements"
			onClick={openEvents}
		>
			<Calendar className={layout === "table" ? "size-4" : undefined} />
		</Button>
	);

	const deleteButton = (
		<DeleteContact contact={contact}>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className={cn(layout === "table" && "size-8")}
				title="Supprimer le contact"
			>
				<Trash className={cn("text-destructive", layout === "table" && "size-4")} />
			</Button>
		</DeleteContact>
	);

	return (
		<>
			{layout === "table" ? (
				<div
					className="flex items-center justify-end gap-0.5"
					data-no-row-click
					onClick={(event) => event.stopPropagation()}
				>
					<Tooltip>
						<TooltipTrigger asChild>{editButton}</TooltipTrigger>
						<TooltipContent>Modifier</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>{eventsButton}</TooltipTrigger>
						<TooltipContent>Événements</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>{deleteButton}</TooltipTrigger>
						<TooltipContent>Supprimer</TooltipContent>
					</Tooltip>
				</div>
			) : (
				<div className="flex flex-no-wrap">
					{editButton}
					{eventsButton}
					{deleteButton}
				</div>
			)}
			<ContactDialog
				mode="edit"
				contact={contact}
				open={editOpen}
				onOpenChange={setEditOpen}
				onNavigateToEvents={openEvents}
			/>
			<EventDialog
				contact={contact}
				open={eventsOpen}
				onOpenChange={setEventsOpen}
				onNavigateToContact={openEdit}
			/>
		</>
	);
}
