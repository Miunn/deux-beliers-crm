"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Download, EllipsisVertical, HardDrive, Loader2, SaveAll, Trash } from "lucide-react";
import { useSaves } from "@/hooks/use-saves";
import type { BackupRecord, DiskState } from "@/data/backup-service";
import { toast } from "sonner";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} o`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

function formatSummary(save: BackupRecord) {
	const { summary } = save;
	return `${summary.contacts} contacts · ${summary.events} événements · ${summary.labels} libellés`;
}

function DiskStatePanel({ disk }: { disk: DiskState }) {
	const hasVolumeStats =
		disk.diskTotalBytes != null && disk.diskUsedBytes != null && disk.diskFreeBytes != null;
	const usagePercent = hasVolumeStats
		? Math.min(100, Math.round((disk.diskUsedBytes! / disk.diskTotalBytes!) * 100))
		: null;

	return (
		<div className="mb-8">
			<div className="flex items-center gap-2 mb-3">
				<HardDrive className="size-4 text-muted-foreground" />
				<p className="text-sm font-medium">État du disque</p>
			</div>
			<ul className="divide-y border-y text-sm">
				{hasVolumeStats ? (
					<li className="py-3 space-y-2">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p>Volume</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									{formatBytes(disk.diskUsedBytes!)} utilisés sur {formatBytes(disk.diskTotalBytes!)}
								</p>
							</div>
							<span className="font-medium tabular-nums shrink-0">
								{formatBytes(disk.diskFreeBytes!)} libres
							</span>
						</div>
						<div className="space-y-1">
							<div className="h-2 rounded-full bg-muted overflow-hidden">
								<div
									className="h-full rounded-full bg-primary transition-all"
									style={{ width: `${usagePercent}%` }}
								/>
							</div>
							<p className="text-xs text-muted-foreground">{usagePercent}% utilisé</p>
						</div>
					</li>
				) : null}
				<li className="flex items-start justify-between gap-4 py-3">
					<div>
						<p>Sauvegardes</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							{disk.backupsCount} fichier{disk.backupsCount > 1 ? "s" : ""}
						</p>
					</div>
					<span className="font-medium tabular-nums shrink-0">
						{formatBytes(disk.backupsSizeBytes)}
					</span>
				</li>
				<li className="py-3">
					<p>Répertoire</p>
					<p className="text-xs text-muted-foreground mt-0.5 break-all">{disk.backupDir}</p>
				</li>
			</ul>
		</div>
	);
}

export default function SavesContent() {
	const { saves, disk, isLoading, mutate } = useSaves();
	const [creating, setCreating] = useState(false);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<BackupRecord | null>(null);

	const handleCreate = async () => {
		setCreating(true);
		try {
			const res = await fetch("/api/saves", { method: "POST" });
			if (!res.ok) {
				toast.error("Impossible de créer la sauvegarde");
				return;
			}
			toast.success("Sauvegarde créée");
			await mutate();
		} catch {
			toast.error("Impossible de créer la sauvegarde");
		} finally {
			setCreating(false);
		}
	};

	const handleDownload = async (save: BackupRecord) => {
		setDownloadingId(save.id);
		try {
			const res = await fetch(`/api/saves/${save.id}/download`);
			if (!res.ok) {
				toast.error("Téléchargement impossible");
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = save.filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Téléchargement impossible");
		} finally {
			setDownloadingId(null);
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setDeletingId(deleteTarget.id);
		try {
			const res = await fetch(`/api/saves/${deleteTarget.id}`, { method: "DELETE" });
			if (!res.ok) {
				toast.error("Suppression impossible");
				return;
			}
			toast.success("Sauvegarde supprimée");
			setDeleteTarget(null);
			await mutate();
		} catch {
			toast.error("Suppression impossible");
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<>
			<p className="text-sm text-muted-foreground mb-6">
				Les sauvegardes automatiques enregistrent un export Excel complet sur le serveur.
				Configurez un cron avec <code className="text-xs">npm run backup</code> ou un appel
				HTTP vers <code className="text-xs">/api/cron/backup</code>.
			</p>

			{isLoading ? <p className="text-sm text-muted-foreground mb-8">Chargement…</p> : null}
			{!isLoading && disk ? <DiskStatePanel disk={disk} /> : null}

			<Button onClick={handleCreate} disabled={creating} className="mb-6">
				{creating ? <Loader2 className="animate-spin" /> : <SaveAll />}
				{creating ? "Création en cours…" : "Créer une sauvegarde maintenant"}
			</Button>

			{!isLoading && saves?.length === 0 ? (
				<p className="text-sm text-muted-foreground">Aucune sauvegarde pour le moment.</p>
			) : null}

			{!isLoading && saves && saves.length > 0 ? (
				<ul className="divide-y border-y">
					{saves.map((save) => (
						<li
							key={save.id}
							className="flex items-start justify-between gap-4 py-4 text-sm"
						>
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-medium">{formatDate(save.createdAt)}</p>
									<span className="text-xs text-muted-foreground rounded-full border px-2 py-0.5">
										{save.source === "cron" ? "Automatique" : "Manuelle"}
									</span>
								</div>
								<p className="text-muted-foreground">{formatSummary(save)}</p>
								<p className="text-xs text-muted-foreground">
									{save.filename} · {formatBytes(save.sizeBytes)}
								</p>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDownload(save)}
									disabled={downloadingId === save.id || deletingId === save.id}
								>
									{downloadingId === save.id ? (
										<Loader2 className="animate-spin" />
									) : (
										<Download />
									)}
									Télécharger
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											disabled={downloadingId === save.id || deletingId === save.id}
										>
											{deletingId === save.id ? (
												<Loader2 className="animate-spin" />
											) : (
												<EllipsisVertical />
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											variant="destructive"
											onClick={() => setDeleteTarget(save)}
										>
											<Trash />
											Supprimer
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</li>
					))}
				</ul>
			) : null}

			<Dialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!deletingId && !open) setDeleteTarget(null);
				}}
			>
				<DialogContent showCloseButton={!deletingId}>
					<DialogHeader>
						<DialogTitle>Supprimer la sauvegarde</DialogTitle>
						<DialogDescription>
							Cette action supprimera définitivement la sauvegarde du{" "}
							{deleteTarget ? formatDate(deleteTarget.createdAt) : ""} du serveur.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteTarget(null)}
							disabled={!!deletingId}
						>
							Annuler
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={!!deletingId}>
							{deletingId ? <Loader2 className="animate-spin" /> : null}
							Supprimer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
