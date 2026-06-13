"use client";

import { ColumnDef } from "@tanstack/react-table";
import { addWeeks } from "date-fns";
import { Bell, Calendar, Pen, Phone, Trash, UserRound } from "lucide-react";
import { cn, textColorForBg } from "@/lib/utils";
import { ContactWithRelations } from "@/types/contact-types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ContactDialog from "../dialogs/ContactDialog";
import DeleteContact from "../dialogs/DeleteContact";
import EventDialog from "../dialogs/EventDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { compareRappelRows, getLastEvent } from "./sorting";

export const columns: ColumnDef<ContactWithRelations>[] = [
	{
		accessorKey: "nom",
		header: "Client",
		cell: ({ row }) => {
			const contact = row.original;
			return (
				<div className="min-w-[180px] max-w-[220px] whitespace-normal">
					<div className="font-medium">{contact.nom || "—"}</div>
					<div className="text-xs text-muted-foreground mt-0.5">
						{[contact.activite?.label, contact.ville].filter(Boolean).join(" • ") || "—"}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "rappel",
		header: "Rappel",
		sortingFn: (rowA, rowB) => compareRappelRows(rowA.original, rowB.original),
		cell: ({ row }) => {
			const contact = row.original;
			const isUrgentReminder = contact.rappel && contact.rappel <= addWeeks(new Date(), 1);

			return (
				<div className="flex items-center gap-1.5 min-w-[120px]">
					{contact.rappel ? (
						<span
							className={cn(
								"inline-flex items-center gap-1 text-sm",
								isUrgentReminder && "font-semibold text-destructive",
							)}
						>
							<Bell className="size-3.5 shrink-0" />
							{new Date(contact.rappel).toLocaleDateString()}
						</span>
					) : (
						<span className="text-muted-foreground text-sm">—</span>
					)}
					{/*<ReminderPopover contact={contact} />*/}
				</div>
			);
		},
	},
	{
		accessorKey: "contact",
		header: "Contact",
		cell: ({ row }) => {
			const contact = row.original;
			return contact.contact ? (
				<span className="inline-flex items-start gap-1 text-sm min-w-[120px] max-w-[160px] whitespace-normal">
					<UserRound className="size-3.5 shrink-0 mt-0.5" />
					<span className="line-clamp-2">{contact.contact}</span>
				</span>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "telephone",
		header: "Téléphone",
		enableSorting: false,
		meta: { className: "w-[8rem] max-w-[8rem]" },
		cell: ({ row }) => {
			const contact = row.original;
			return contact.telephone ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<a
							className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline max-w-[8rem] truncate"
							href={`tel:${contact.telephone}`}
						>
							<Phone className="size-3 shrink-0" />
							<span className="truncate">{contact.telephone}</span>
						</a>
					</TooltipTrigger>
					<TooltipContent>{contact.telephone}</TooltipContent>
				</Tooltip>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "horaires",
		header: "Horaires",
		enableSorting: false,
		cell: ({ row }) => {
			const contact = row.original;
			return contact.horaires ? (
				<div
					className="text-sm text-muted-foreground line-clamp-2 min-w-[140px] max-w-[200px] whitespace-normal"
					dangerouslySetInnerHTML={{
						__html: String(contact.horaires).replace(/\n/g, "<br/>"),
					}}
				/>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "lastEvent",
		header: "Dernier événement",
		enableSorting: false,
		cell: ({ row }) => {
			const lastEvent = getLastEvent(row.original);
			return lastEvent ? (
				<div className="flex items-start gap-1 text-sm min-w-[160px] max-w-[240px] whitespace-normal">
					<Calendar className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
					<span className="line-clamp-2">{lastEvent.commentaires || "—"}</span>
				</div>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "labels",
		header: "Libellés",
		enableSorting: false,
		cell: ({ row }) => {
			const contact = row.original;
			return (
				<div className="flex flex-wrap items-center gap-1 min-w-[140px] max-w-[200px] whitespace-normal">
					{contact.labels.map((lb) => (
						<Badge
							key={`${lb.id}-${lb.label}`}
							className="text-[11px] px-1.5 py-0"
							style={{
								background: lb.color || "#eef2ff",
								color: textColorForBg(lb.color || "#eef2ff"),
							}}
						>
							{lb.label}
						</Badge>
					))}
					{/*<ContactLabelsPopover contact={contact}>
						<Button type="button" variant="ghost" size="sm" className="size-6" title="Ajouter un libellé">
							<Plus className="size-3.5" />
						</Button>
					</ContactLabelsPopover>*/}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		enableSorting: false,
		cell: ({ row }) => {
			const contact = row.original;
			return (
				<div className="flex items-center justify-end gap-0.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<ContactDialog mode="edit" contact={contact}>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-8"
									title="Modifier le contact"
								>
									<Pen className="size-4" />
								</Button>
							</ContactDialog>
						</TooltipTrigger>
						<TooltipContent>Modifier</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<EventDialog contact={contact}>
								<Button type="button" variant="ghost" size="icon" className="size-8" title="Événements">
									<Calendar className="size-4" />
								</Button>
							</EventDialog>
						</TooltipTrigger>
						<TooltipContent>Événements</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<DeleteContact contact={contact}>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-8"
									title="Supprimer le contact"
								>
									<Trash className="size-4 text-destructive" />
								</Button>
							</DeleteContact>
						</TooltipTrigger>
						<TooltipContent>Supprimer</TooltipContent>
					</Tooltip>
				</div>
			);
		},
	},
];
