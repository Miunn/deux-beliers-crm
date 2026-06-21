"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import type { ImportCounts, ImportPreview } from "@/lib/import-workbook";

type RecapItem = {
	label: string;
	count: number;
	detail?: string;
};

function buildRecapItems(counts: ImportCounts): RecapItem[] {
	return [
		{
			label: "Contacts",
			count: counts.contacts,
			detail: `${counts.activeContacts} actifs, ${counts.archivedContacts} archivés`,
		},
		{ label: "Événements", count: counts.events },
		{ label: "Libellés", count: counts.labels },
		{ label: "Colonnes Kanban", count: counts.kanbanColumns },
		{ label: "Activités", count: counts.activites },
		{ label: "Natures d'événement", count: counts.natures },
		{ label: "Associations contact / libellé", count: counts.contactLabels },
	];
}

function RecapList({ items }: { items: RecapItem[] }) {
	return (
		<ul className="divide-y border-y">
			{items.map((item) => (
				<li key={item.label} className="flex items-start justify-between gap-4 py-3 text-sm">
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
	);
}

export default function ImportContent() {
	const fileInputId = useId();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<ImportPreview | null>(null);
	const [importedCounts, setImportedCounts] = useState<ImportCounts | null>(null);
	const [parsing, setParsing] = useState(false);
	const [importing, setImporting] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [importSuccess, setImportSuccess] = useState(false);
	const [parseError, setParseError] = useState<string | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [importDetails, setImportDetails] = useState<string[]>([]);

	const resetSelection = () => {
		setSelectedFile(null);
		setPreview(null);
		setImportedCounts(null);
		setParseError(null);
		setImportError(null);
		setImportDetails([]);
		setImportSuccess(false);
		setConfirmOpen(false);
	};

	const handleFileSelect = async (file: File) => {
		setSelectedFile(file);
		setPreview(null);
		setImportedCounts(null);
		setParseError(null);
		setImportError(null);
		setImportDetails([]);
		setImportSuccess(false);
		setParsing(true);

		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await fetch("/api/contacts/import/preview", {
				method: "POST",
				body: fd,
			});

			if (!res.ok) {
				let message = "Analyse échouée";
				try {
					const json = await res.json();
					message = json?.error || message;
				} catch {}
				setParseError(message);
				return;
			}

			const data = (await res.json()) as ImportPreview;
			setPreview(data);
		} catch {
			setParseError("Analyse échouée");
		} finally {
			setParsing(false);
		}
	};

	const handleImport = async () => {
		if (!selectedFile || !preview?.valid) return;

		setImporting(true);
		setImportError(null);
		setImportDetails([]);

		try {
			const fd = new FormData();
			fd.append("file", selectedFile);
			const res = await fetch("/api/contacts/import", {
				method: "POST",
				body: fd,
			});

			if (!res.ok) {
				let message = "Import échoué";
				let details: string[] = [];
				try {
					const json = await res.json();
					message = json?.error || message;
					details = Array.isArray(json?.details) ? json.details : [];
				} catch {}
				setImportError(message);
				setImportDetails(details);
				setConfirmOpen(false);
			} else {
				setImportedCounts(preview.counts);
				setImportSuccess(true);
				setConfirmOpen(false);
			}
		} catch {
			setImportError("Import échoué");
			setConfirmOpen(false);
		} finally {
			setImporting(false);
		}
	};

	const recapItems = preview ? buildRecapItems(preview.counts) : [];
	const successRecapItems = importedCounts ? buildRecapItems(importedCounts) : [];

	if (importSuccess && importedCounts) {
		return (
			<div className="space-y-6">
				<div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
					<div className="flex items-start gap-3">
						<CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium">Import réussi</p>
							<p className="text-sm text-muted-foreground mt-1">
								Les données ont été importées. L&apos;ancienne base a été entièrement
								remplacée.
							</p>
						</div>
					</div>
				</div>

				<div>
					<p className="text-sm font-medium mb-3">Données importées</p>
					<RecapList items={successRecapItems} />
				</div>

				<div className="flex flex-wrap gap-3">
					<Button asChild>
						<Link href="/table">Voir les contacts</Link>
					</Button>
					<Button variant="outline" onClick={resetSelection}>
						Importer un autre fichier
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<p className="text-sm text-muted-foreground mb-6">
				Importer des données depuis un fichier Excel (.xlsx, .xls). Les données existantes
				seront remplacées après validation.
			</p>

			<input
				id={fileInputId}
				type="file"
				accept=".xlsx,.xls"
				className="hidden"
				onChange={async (e) => {
					const input = e.currentTarget;
					const file = input.files?.[0];
					if (!file) return;
					await handleFileSelect(file);
					input.value = "";
				}}
			/>

			<div className="flex flex-wrap items-center gap-3 mb-6">
				<Button
					onClick={() => document.getElementById(fileInputId)?.click()}
					disabled={parsing || importing}
					variant="outline"
				>
					{parsing ? <Loader2 className="animate-spin" /> : <Upload />}
					{parsing ? "Analyse en cours…" : "Choisir un fichier"}
				</Button>
				{selectedFile ? (
					<Button variant="ghost" onClick={resetSelection} disabled={parsing || importing}>
						Changer de fichier
					</Button>
				) : null}
			</div>

			{selectedFile ? (
				<p className="text-sm text-muted-foreground mb-6">
					Fichier sélectionné : <span className="text-foreground">{selectedFile.name}</span>
				</p>
			) : null}

			{parseError ? (
				<div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
					{parseError}
				</div>
			) : null}

			{preview ? (
				<div className="space-y-6">
					<div
						className={
							preview.valid
								? "rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3"
								: "rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
						}
					>
						<div className="flex items-start gap-3">
							{preview.valid ? (
								<CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
							) : (
								<AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
							)}
							<div>
								<p className="text-sm font-medium">
									{preview.valid
										? "Fichier valide — prêt à importer"
										: "Fichier invalide — import impossible"}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{preview.valid
										? "Le fichier a été analysé sans erreur. Confirmez l'import pour remplacer toutes les données existantes."
										: (preview.error ?? "Des erreurs empêchent l'import.")}
								</p>
							</div>
						</div>
					</div>

					<div>
						<p className="text-sm font-medium mb-3">Données détectées</p>
						<RecapList items={recapItems} />
					</div>

					{preview.details.length > 0 ? (
						<div>
							<p className="text-sm font-medium mb-3 text-destructive">Erreurs détectées</p>
							<div className="max-h-64 overflow-auto rounded-md border p-3">
								<ul className="list-disc pl-5 text-sm space-y-1">
									{preview.details.map((detail, i) => (
										<li key={i}>{detail}</li>
									))}
								</ul>
							</div>
						</div>
					) : null}

					{importError ? (
						<div>
							<p className="text-sm font-medium mb-3 text-destructive">{importError}</p>
							{importDetails.length > 0 ? (
								<div className="max-h-64 overflow-auto rounded-md border p-3">
									<ul className="list-disc pl-5 text-sm space-y-1">
										{importDetails.map((detail, i) => (
											<li key={i}>{detail}</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					) : null}

					<Button
						onClick={() => setConfirmOpen(true)}
						disabled={!preview.valid || importing || parsing}
					>
						<Upload />
						Importer les données
					</Button>
				</div>
			) : null}

			<Dialog
				open={confirmOpen}
				onOpenChange={(open) => {
					if (!importing) setConfirmOpen(open);
				}}
			>
				<DialogContent showCloseButton={!importing}>
					<DialogHeader>
						<DialogTitle>Confirmer l&apos;import</DialogTitle>
						<DialogDescription asChild>
							<div className="space-y-3 text-left">
								<p>
									Cette action est irréversible. Toutes les données existantes seront
									définitivement supprimées et remplacées par le contenu du fichier :
								</p>
								<p className="font-medium text-foreground">{selectedFile?.name}</p>
								<p className="text-destructive">
									Contacts, événements, libellés, activités, natures et colonnes Kanban
									seront effacés avant l&apos;import.
								</p>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmOpen(false)}
							disabled={importing}
						>
							Annuler
						</Button>
						<Button variant="destructive" onClick={handleImport} disabled={importing}>
							{importing ? <Loader2 className="animate-spin" /> : null}
							{importing ? "Import en cours…" : "Confirmer l'import"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
