import * as XLSX from "xlsx";

type Row = Record<string, unknown>;

export type ImportCounts = {
	contacts: number;
	activeContacts: number;
	archivedContacts: number;
	events: number;
	labels: number;
	natures: number;
	activites: number;
	kanbanColumns: number;
	contactLabels: number;
};

export type ImportPreview = {
	valid: boolean;
	error: string | null;
	details: string[];
	counts: ImportCounts;
	sheets: string[];
};

const REQUIRED_SHEETS = [
	"Contacts",
	"Events",
	"Labels",
	"Activite",
	"Nature",
	"ContactLabels",
	"KanbanColumns",
] as const;

const MAX_DETAILS = 50;

function readSheet<T extends Row>(wb: XLSX.WorkBook, name: string): T[] | null {
	const sheet = wb.Sheets[name];
	if (!sheet) return null;
	return XLSX.utils.sheet_to_json<T>(sheet);
}

function isIsoDate(s: string): boolean {
	const d = new Date(s);
	return !Number.isNaN(d.getTime());
}

function pushError(errors: string[], message: string) {
	if (errors.length < MAX_DETAILS) errors.push(message);
}

function checkDuplicateIds(rows: Row[], sheet: string, errors: string[]) {
	const seen = new Set<string>();
	for (const row of rows) {
		const id = String(row["Id"] ?? "").trim();
		if (!id) {
			pushError(errors, `${sheet}: Id manquant`);
			continue;
		}
		if (seen.has(id)) pushError(errors, `${sheet}: Id dupliqué: ${id}`);
		seen.add(id);
	}
}

export function parseImportWorkbook(arrayBuffer: ArrayBuffer): ImportPreview {
	const errors: string[] = [];
	let workbook: XLSX.WorkBook;

	try {
		workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
	} catch {
		return {
			valid: false,
			error: "Fichier illisible",
			details: ["Impossible de lire le fichier Excel."],
			counts: emptyCounts(),
			sheets: [],
		};
	}

	for (const sheet of REQUIRED_SHEETS) {
		if (!workbook.SheetNames.includes(sheet)) {
			pushError(errors, `Feuille manquante: ${sheet}`);
		}
	}

	if (errors.length) {
		return {
			valid: false,
			error: "Format invalide",
			details: errors,
			counts: emptyCounts(),
			sheets: workbook.SheetNames,
		};
	}

	const contacts = readSheet<Row>(workbook, "Contacts") ?? [];
	const events = readSheet<Row>(workbook, "Events") ?? [];
	const labels = readSheet<Row>(workbook, "Labels") ?? [];
	const activites = readSheet<Row>(workbook, "Activite") ?? [];
	const natures = readSheet<Row>(workbook, "Nature") ?? [];
	const contactLabels = readSheet<Row>(workbook, "ContactLabels") ?? [];
	const kanbanColumns = readSheet<Row>(workbook, "KanbanColumns") ?? [];

	checkDuplicateIds(contacts, "Contacts", errors);
	checkDuplicateIds(events, "Events", errors);
	checkDuplicateIds(labels, "Labels", errors);
	checkDuplicateIds(activites, "Activite", errors);
	checkDuplicateIds(natures, "Nature", errors);
	checkDuplicateIds(kanbanColumns, "KanbanColumns", errors);

	const activiteIds = new Set(activites.map((r) => String(r["Id"])));
	const labelIds = new Set(labels.map((r) => String(r["Id"])));
	const natureIds = new Set(natures.map((r) => String(r["Id"])));
	const contactIds = new Set(contacts.map((r) => String(r["Id"])));
	const kanbanIds = new Set(kanbanColumns.map((r) => String(r["Id"])));

	for (const c of contacts) {
		const id = String(c["Id"] ?? "").trim();
		if (!id) continue;

		const aid = String(c["ActiviteId"] ?? "").trim();
		if (aid && !activiteIds.has(aid)) {
			pushError(errors, `Contacts.ActiviteId inconnu: ${aid}`);
		}

		const kid = String(c["KanbanColumnId"] ?? "").trim();
		if (kid && !kanbanIds.has(kid)) {
			pushError(errors, `Contacts.KanbanColumnId inconnu: ${kid}`);
		}

		const rappel = String(c["Rappel"] ?? "").trim();
		if (rappel && !isIsoDate(rappel)) {
			pushError(errors, `Contacts.Rappel invalide: ${rappel}`);
		}
	}

	for (const e of events) {
		const cid = String(e["ContactId"] ?? "").trim();
		if (!cid || !contactIds.has(cid)) {
			pushError(errors, `Events.ContactId invalide: ${cid || "(vide)"}`);
		}

		const nid = String(e["NatureId"] ?? "").trim();
		if (nid && !natureIds.has(nid)) {
			pushError(errors, `Events.NatureId inconnu: ${nid}`);
		}

		const date = String(e["Date"] ?? "").trim();
		if (!date) {
			pushError(errors, "Events.Date manquante");
		} else if (!isIsoDate(date)) {
			pushError(errors, `Events.Date invalide: ${date}`);
		}
	}

	for (const cl of contactLabels) {
		const cid = String(cl["ContactId"] ?? "").trim();
		const lid = String(cl["LabelId"] ?? "").trim();
		if (!cid || !contactIds.has(cid)) {
			pushError(errors, `ContactLabels.ContactId inconnu: ${cid || "(vide)"}`);
		}
		if (!lid || !labelIds.has(lid)) {
			pushError(errors, `ContactLabels.LabelId inconnu: ${lid || "(vide)"}`);
		}
	}

	const activeContacts = contacts.filter((c) => c["Archive"] !== "VRAI").length;
	const archivedContacts = contacts.length - activeContacts;

	const counts: ImportCounts = {
		contacts: contacts.length,
		activeContacts,
		archivedContacts,
		events: events.length,
		labels: labels.length,
		natures: natures.length,
		activites: activites.length,
		kanbanColumns: kanbanColumns.length,
		contactLabels: contactLabels.length,
	};

	if (errors.length) {
		return {
			valid: false,
			error: "Format invalide",
			details: errors,
			counts,
			sheets: workbook.SheetNames,
		};
	}

	return {
		valid: true,
		error: null,
		details: [],
		counts,
		sheets: workbook.SheetNames,
	};
}

export function getImportWorkbookData(arrayBuffer: ArrayBuffer) {
	const preview = parseImportWorkbook(arrayBuffer);
	if (!preview.valid) {
		throw new ImportValidationError(preview.error ?? "Format invalide", preview.details);
	}

	const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
	return {
		contacts: readSheet<Row>(workbook, "Contacts") ?? [],
		events: readSheet<Row>(workbook, "Events") ?? [],
		labels: readSheet<Row>(workbook, "Labels") ?? [],
		activites: readSheet<Row>(workbook, "Activite") ?? [],
		natures: readSheet<Row>(workbook, "Nature") ?? [],
		contactLabels: readSheet<Row>(workbook, "ContactLabels") ?? [],
		kanbanColumns: readSheet<Row>(workbook, "KanbanColumns") ?? [],
	};
}

export class ImportValidationError extends Error {
	details: string[];

	constructor(message: string, details: string[]) {
		super(message);
		this.details = details;
	}
}

function emptyCounts(): ImportCounts {
	return {
		contacts: 0,
		activeContacts: 0,
		archivedContacts: 0,
		events: 0,
		labels: 0,
		natures: 0,
		activites: 0,
		kanbanColumns: 0,
		contactLabels: 0,
	};
}

export { type Row as ImportRow };
