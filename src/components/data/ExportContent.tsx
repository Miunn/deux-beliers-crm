"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import type { ExportSummary } from "@/data/export-service";

type ExportRecapItem = {
	label: string;
	count: number;
	detail?: string;
};

function buildRecapItems(summary: ExportSummary): ExportRecapItem[] {
	return [
		{
			label: "Contacts",
			count: summary.contacts,
			detail: `${summary.activeContacts} actifs, ${summary.archivedContacts} archivés`,
		},
		{ label: "Événements", count: summary.events },
		{ label: "Libellés", count: summary.labels },
		{ label: "Colonnes Kanban", count: summary.kanbanColumns },
		{ label: "Activités", count: summary.activites },
		{ label: "Natures d'événement", count: summary.natures },
		{ label: "Associations contact / libellé", count: summary.contactLabels },
	];
}

export default function ExportContent({ summary }: { summary: ExportSummary }) {
	const [exporting, setExporting] = useState(false);
	const recapItems = buildRecapItems(summary);

	const handleExport = async () => {
		setExporting(true);
		try {
			const res = await fetch("/api/contacts/export");
			if (!res.ok) return;
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "contacts.xlsx";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} finally {
			setExporting(false);
		}
	};

	return (
		<>
			<p className="text-sm text-muted-foreground mb-6">
				Télécharger l&apos;ensemble des données au format Excel (.xlsx), réparties en{" "}
				{recapItems.length} feuilles.
			</p>

			<div className="mb-6">
				<p className="text-sm font-medium mb-3">Contenu de l&apos;export</p>
				<ul className="divide-y border-y">
					{recapItems.map((item) => (
						<li
							key={item.label}
							className="flex items-start justify-between gap-4 py-3 text-sm"
						>
							<div>
								<p>{item.label}</p>
								{item.detail ? (
									<p className="text-muted-foreground text-xs mt-0.5">{item.detail}</p>
								) : null}
							</div>
							<span className="font-medium tabular-nums shrink-0">
								{item.count.toLocaleString("fr-FR")}
							</span>
						</li>
					))}
				</ul>
			</div>

			<Button onClick={handleExport} disabled={exporting} variant="outline">
				{exporting ? <Loader2 className="animate-spin" /> : <Download />}
				{exporting ? "Export en cours…" : "Télécharger"}
			</Button>
		</>
	);
}
