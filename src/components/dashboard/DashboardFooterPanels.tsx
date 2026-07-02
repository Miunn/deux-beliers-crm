"use client";

import Link from "next/link";
import { Calendar1, Download, Plus, SquareKanban, Tags, Upload } from "lucide-react";

import ContactDialog from "@/components/dialogs/ContactDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/data/dashboard-service";

type Props = {
	kpis: Pick<DashboardKpis, "dormantContacts" | "uncategorizedKanban">;
	lastBackupAt: string | null;
};

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const quickLinks = [
	{ href: "/new/kanban", label: "Kanban", icon: SquareKanban },
	{ href: "/tags", label: "Libellés", icon: Tags },
	{ href: "/natures", label: "Natures", icon: Calendar1 },
	{ href: "/import", label: "Importer", icon: Upload },
	{ href: "/export", label: "Exporter", icon: Download },
] as const;

export default function DashboardFooterPanels({ kpis, lastBackupAt }: Props) {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card className="py-0 gap-0">
				<CardHeader className="border-b py-4">
					<CardTitle className="text-base">Santé des données</CardTitle>
				</CardHeader>
				<CardContent className="px-6 py-4 space-y-4 text-sm">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p>Dernière sauvegarde</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{lastBackupAt ? formatDateTime(lastBackupAt) : "Aucune sauvegarde enregistrée"}
							</p>
						</div>
						<Link href="/saves" className="text-sm hover:underline shrink-0">
							Gérer
						</Link>
					</div>
					<div className="flex items-start justify-between gap-4">
						<div>
							<p>Contacts dormants</p>
							<p className="text-xs text-muted-foreground mt-0.5">Sans événement depuis 90 jours</p>
						</div>
						<span className="font-medium tabular-nums shrink-0">{kpis.dormantContacts}</span>
					</div>
				</CardContent>
			</Card>

			<Card className="py-0 gap-0">
				<CardHeader className="border-b py-4">
					<CardTitle className="text-base">Actions rapides</CardTitle>
				</CardHeader>
				<CardContent className="px-6 py-4">
					<div className="flex flex-wrap gap-2">
						<ContactDialog mode="create">
							<Button variant="outline" size="sm">
								<Plus className="size-4" />
								Nouveau contact
							</Button>
						</ContactDialog>
						{quickLinks.map(({ href, label, icon: Icon }) => (
							<Button key={href} variant="outline" size="sm" asChild>
								<Link href={href}>
									<Icon className="size-4" />
									{label}
								</Link>
							</Button>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
