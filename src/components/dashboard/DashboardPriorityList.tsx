"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { addWeeks } from "date-fns";

import ContactActionDialogs from "@/components/dialogs/ContactActionDialogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfToday } from "@/lib/reminder-filter";
import { cn } from "@/lib/utils";
import { ContactWithRelations } from "@/types/contact-types";

type Props = {
	contacts: ContactWithRelations[];
};

function formatReminderDate(value: Date | string) {
	return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function isOverdue(value: Date | string) {
	return new Date(value) < startOfToday();
}

function isUrgent(value: Date | string) {
	return new Date(value) <= addWeeks(new Date(), 1);
}

export default function DashboardPriorityList({ contacts }: Props) {
	return (
		<Card className="py-0 gap-0">
			<CardHeader className="border-b py-4">
				<CardTitle className="text-base">À traiter en priorité</CardTitle>
			</CardHeader>
			<CardContent className="px-0 py-0">
				{contacts.length === 0 ? (
					<p className="px-6 py-6 text-sm text-muted-foreground">Aucun rappel urgent pour le moment.</p>
				) : (
					<ul className="max-h-[500px] divide-y overflow-y-auto">
						{contacts.map((contact) => {
							const overdue = contact.rappel ? isOverdue(contact.rappel) : false;
							const urgent = contact.rappel ? isUrgent(contact.rappel) : false;

							return (
								<li key={contact.id} className="flex items-start justify-between gap-3 px-6 py-3">
									<div className="min-w-0 space-y-1">
										<Link
											href={`/new?q=${encodeURIComponent(contact.nom)}`}
											className="font-medium hover:underline"
										>
											{contact.nom}
										</Link>
										<p className="text-sm text-muted-foreground truncate">
											{[contact.activite?.label, contact.ville].filter(Boolean).join(" · ") ||
												"—"}
										</p>
										{contact.rappel ? (
											<p
												className={cn(
													"flex items-center gap-1 text-sm",
													overdue && "font-semibold text-destructive",
													!overdue && urgent && "text-destructive",
												)}
											>
												<Bell className="size-3.5 shrink-0" />
												{overdue ? "En retard · " : ""}
												{formatReminderDate(contact.rappel)}
											</p>
										) : null}
									</div>
									<ContactActionDialogs contact={contact} layout="inline" />
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
