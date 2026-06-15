import { statfs, mkdir, writeFile, access, unlink } from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { buildExportWorkbookBuffer } from "@/lib/export-workbook";
import { getExportSummary, type ExportSummary } from "@/data/export-service";

export type BackupSource = "cron" | "manual";

export type BackupRecord = {
	id: string;
	filename: string;
	createdAt: string;
	source: BackupSource;
	sizeBytes: number;
	summary: ExportSummary;
};

export type DiskState = {
	backupDir: string;
	backupsCount: number;
	backupsSizeBytes: number;
	diskTotalBytes: number | null;
	diskUsedBytes: number | null;
	diskFreeBytes: number | null;
};

type BackupRow = {
	id: string;
	filename: string;
	source: string;
	sizeBytes: number;
	contacts: number;
	activeContacts: number;
	archivedContacts: number;
	events: number;
	labels: number;
	natures: number;
	activites: number;
	kanbanColumns: number;
	contactLabels: number;
	createdAt: Date;
};

export function getBackupDir(): string {
	return process.env.BACKUP_DIR ?? path.join(process.cwd(), "data", "backups");
}

function getBackupFilePathForId(id: string): string {
	return path.join(getBackupDir(), `${id}.xlsx`);
}

async function ensureBackupDir(): Promise<string> {
	const dir = getBackupDir();
	await mkdir(dir, { recursive: true });
	return dir;
}

function toExportSummary(backup: Pick<
	BackupRow,
	| "contacts"
	| "activeContacts"
	| "archivedContacts"
	| "events"
	| "labels"
	| "natures"
	| "activites"
	| "kanbanColumns"
	| "contactLabels"
>): ExportSummary {
	return {
		contacts: backup.contacts,
		activeContacts: backup.activeContacts,
		archivedContacts: backup.archivedContacts,
		events: backup.events,
		labels: backup.labels,
		natures: backup.natures,
		activites: backup.activites,
		kanbanColumns: backup.kanbanColumns,
		contactLabels: backup.contactLabels,
	};
}

function toBackupRecord(backup: BackupRow): BackupRecord {
	return {
		id: backup.id,
		filename: backup.filename,
		createdAt: backup.createdAt.toISOString(),
		source: backup.source as BackupSource,
		sizeBytes: backup.sizeBytes,
		summary: toExportSummary(backup),
	};
}

async function pruneOldBackups() {
	const retention = Number(process.env.BACKUP_RETENTION_COUNT ?? "30");
	if (!Number.isFinite(retention) || retention <= 0) return;

	const stale = await prisma.backup.findMany({
		orderBy: { createdAt: "desc" },
		skip: retention,
		select: { id: true },
	});

	await Promise.all(stale.map((backup) => deleteBackup(backup.id)));
}

export async function listBackups(): Promise<BackupRecord[]> {
	const backups = await prisma.backup.findMany({
		orderBy: { createdAt: "desc" },
	});
	return backups.map(toBackupRecord);
}

export async function getDiskState(): Promise<DiskState> {
	const backupDir = await ensureBackupDir();
	const [aggregate, filesystem] = await Promise.all([
		prisma.backup.aggregate({
			_sum: { sizeBytes: true },
			_count: true,
		}),
		getFilesystemStats(backupDir),
	]);

	return {
		backupDir,
		backupsCount: aggregate._count,
		backupsSizeBytes: aggregate._sum.sizeBytes ?? 0,
		...filesystem,
	};
}

async function getFilesystemStats(targetPath: string): Promise<{
	diskTotalBytes: number | null;
	diskUsedBytes: number | null;
	diskFreeBytes: number | null;
}> {
	try {
		const stats = await statfs(targetPath);
		const totalBytes = stats.bsize * stats.blocks;
		const freeBytes = stats.bsize * stats.bavail;
		return {
			diskTotalBytes: totalBytes,
			diskFreeBytes: freeBytes,
			diskUsedBytes: totalBytes - freeBytes,
		};
	} catch {
		return {
			diskTotalBytes: null,
			diskFreeBytes: null,
			diskUsedBytes: null,
		};
	}
}

export async function createBackup(source: BackupSource): Promise<BackupRecord> {
	const dir = await ensureBackupDir();
	const [buffer, summary] = await Promise.all([
		buildExportWorkbookBuffer(),
		getExportSummary(),
	]);

	const id = createId();
	const filename = `crm-backup-${id}.xlsx`;

	await writeFile(path.join(dir, `${id}.xlsx`), buffer);

	const backup = await prisma.backup.create({
		data: {
			id,
			filename,
			source,
			sizeBytes: buffer.byteLength,
			...summary,
		},
	});

	await pruneOldBackups();
	return toBackupRecord(backup);
}

export async function getBackupFilePath(id: string): Promise<string | null> {
	const backup = await prisma.backup.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!backup) return null;

	const filePath = getBackupFilePathForId(id);
	try {
		await access(filePath);
		return filePath;
	} catch {
		return null;
	}
}

export async function getBackupRecord(id: string): Promise<BackupRecord | null> {
	const backup = await prisma.backup.findUnique({ where: { id } });
	return backup ? toBackupRecord(backup) : null;
}

export async function deleteBackup(id: string) {
	const backup = await prisma.backup.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!backup) return false;

	await Promise.allSettled([unlink(getBackupFilePathForId(id))]);
	await prisma.backup.delete({ where: { id } });
	return true;
}
