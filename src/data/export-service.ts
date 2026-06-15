import { prisma } from "@/lib/prisma";

export type ExportSummary = {
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

export async function getExportSummary(): Promise<ExportSummary> {
	const [
		contacts,
		activeContacts,
		archivedContacts,
		events,
		labels,
		natures,
		activites,
		kanbanColumns,
		contactLabelsResult,
	] = await Promise.all([
		prisma.contact.count(),
		prisma.contact.count({ where: { active: true } }),
		prisma.contact.count({ where: { active: false } }),
		prisma.event.count(),
		prisma.label.count(),
		prisma.nature.count(),
		prisma.activite.count(),
		prisma.kanbanColumn.count(),
		prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM _ContactToLabel`,
	]);

	return {
		contacts,
		activeContacts,
		archivedContacts,
		events,
		labels,
		natures,
		activites,
		kanbanColumns,
		contactLabels: Number(contactLabelsResult[0]?.count ?? 0),
	};
}
