import { format, startOfMonth, subDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

import { listBackups } from "@/data/backup-service";
import { KanbanService } from "@/data/kanban-service";
import { inSevenDaysFromNow, startOfToday } from "@/lib/reminder-filter";
import { prisma } from "@/lib/prisma";
import { ContactWithRelations } from "@/types/contact-types";

export type DashboardKpis = {
	activeContacts: number;
	archivedContacts: number;
	remindersWithin7d: number;
	overdueReminders: number;
	contactsWithoutReminder: number;
	eventsLast30d: number;
	uncategorizedKanban: number;
	dormantContacts: number;
};

export type DashboardKanbanColumn = {
	id: string;
	name: string;
	color: string;
	count: number;
};

export type DashboardActiviteBreakdown = {
	id: string;
	label: string;
	count: number;
};

export type DashboardLabelBreakdown = {
	id: string;
	label: string;
	color: string;
	count: number;
};

export type DashboardRecentEvent = {
	id: string;
	date: string;
	commentaires: string | null;
	natureLabel: string | null;
	contactId: string;
	contactName: string;
};

export type DashboardEventsByMonth = {
	month: string;
	label: string;
	count: number;
};

export type DashboardEventsByNature = {
	natureId: string;
	label: string;
	count: number;
};

export type DashboardData = {
	kpis: DashboardKpis;
	priorityContacts: ContactWithRelations[];
	kanbanColumns: DashboardKanbanColumn[];
	activiteBreakdown: DashboardActiviteBreakdown[];
	labelBreakdown: DashboardLabelBreakdown[];
	recentEvents: DashboardRecentEvent[];
	eventsByMonth: DashboardEventsByMonth[];
	eventsByNature: DashboardEventsByNature[];
	lastBackupAt: string | null;
};

const contactInclude = {
	activite: true,
	labels: true,
	kanbanColumn: true,
	events: {
		include: { nature: true },
		orderBy: { date: "desc" as const },
		take: 3,
	},
};

async function getKpis(today: Date, in7Days: Date, eventsSince: Date, dormantSince: Date): Promise<DashboardKpis> {
	const [
		activeContacts,
		archivedContacts,
		remindersWithin7d,
		overdueReminders,
		contactsWithoutReminder,
		eventsLast30d,
		uncategorizedKanban,
		dormantContacts,
	] = await Promise.all([
		prisma.contact.count({ where: { active: true } }),
		prisma.contact.count({ where: { active: false } }),
		prisma.contact.count({
			where: {
				active: true,
				rappel: { not: null, lte: in7Days },
			},
		}),
		prisma.contact.count({
			where: {
				active: true,
				rappel: { not: null, lt: today },
			},
		}),
		prisma.contact.count({
			where: { active: true, rappel: null },
		}),
		prisma.event.count({
			where: { date: { gte: eventsSince } },
		}),
		prisma.contact.count({
			where: { active: true, kanbanColumnId: null },
		}),
		prisma.contact.count({
			where: {
				active: true,
				OR: [{ events: { none: {} } }, { events: { every: { date: { lt: dormantSince } } } }],
			},
		}),
	]);

	return {
		activeContacts,
		archivedContacts,
		remindersWithin7d,
		overdueReminders,
		contactsWithoutReminder,
		eventsLast30d,
		uncategorizedKanban,
		dormantContacts,
	};
}

async function getPriorityContacts(in7Days: Date): Promise<ContactWithRelations[]> {
	return prisma.contact.findMany({
		where: {
			active: true,
			rappel: { not: null, lte: in7Days },
		},
		include: contactInclude,
		orderBy: { rappel: "asc" },
		take: 8,
	});
}

async function getKanbanBreakdown(): Promise<DashboardKanbanColumn[]> {
	const [columns, counts] = await Promise.all([
		KanbanService.get(),
		prisma.contact.groupBy({
			by: ["kanbanColumnId"],
			where: { active: true },
			_count: true,
		}),
	]);

	const countByColumnId = new Map(
		counts.map((row) => [row.kanbanColumnId ?? "uncategorized", row._count]),
	);

	const pipeline: DashboardKanbanColumn[] = columns.map((column) => ({
		id: column.id,
		name: column.name,
		color: column.color,
		count: countByColumnId.get(column.id) ?? 0,
	}));

	const uncategorizedCount = countByColumnId.get("uncategorized") ?? 0;
	if (uncategorizedCount > 0) {
		pipeline.push({
			id: "uncategorized",
			name: "Non classés",
			color: "#94a3b8",
			count: uncategorizedCount,
		});
	}

	return pipeline;
}

async function getActiviteBreakdown(): Promise<DashboardActiviteBreakdown[]> {
	const grouped = await prisma.contact.groupBy({
		by: ["activiteId"],
		where: { active: true },
		_count: true,
	});

	const activiteIds = grouped
		.map((row) => row.activiteId)
		.filter((id): id is string => id != null);

	const activites = activiteIds.length
		? await prisma.activite.findMany({ where: { id: { in: activiteIds } } })
		: [];

	const labelById = new Map(activites.map((activite) => [activite.id, activite.label]));

	return grouped
		.map((row) => ({
			id: row.activiteId ?? "none",
			label: row.activiteId ? (labelById.get(row.activiteId) ?? "—") : "Sans activité",
			count: row._count,
		}))
		.sort((a, b) => b.count - a.count);
}

async function getLabelBreakdown(): Promise<DashboardLabelBreakdown[]> {
	const labels = await prisma.label.findMany({
		include: {
			_count: {
				select: {
					contacts: { where: { active: true } },
				},
			},
		},
	});

	return labels
		.map((label) => ({
			id: label.id,
			label: label.label,
			color: label.color,
			count: label._count.contacts,
		}))
		.filter((label) => label.count > 0)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
}

async function getRecentEvents(): Promise<DashboardRecentEvent[]> {
	const events = await prisma.event.findMany({
		take: 10,
		orderBy: { date: "desc" },
		include: {
			nature: true,
			contact: { select: { id: true, nom: true } },
		},
	});

	return events.map((event) => ({
		id: event.id,
		date: event.date.toISOString(),
		commentaires: event.commentaires,
		natureLabel: event.nature?.label ?? null,
		contactId: event.contact.id,
		contactName: event.contact.nom,
	}));
}

async function getLastBackupAt(): Promise<string | null> {
	const backups = await listBackups();
	return backups[0]?.createdAt ?? null;
}

const EVENT_CHART_MONTHS = 12;

async function getEventsByMonth(): Promise<DashboardEventsByMonth[]> {
	const since = startOfMonth(subMonths(new Date(), EVENT_CHART_MONTHS - 1));
	const events = await prisma.event.findMany({
		where: { date: { gte: since } },
		select: { date: true },
	});

	const buckets = new Map<string, number>();
	for (let index = EVENT_CHART_MONTHS - 1; index >= 0; index -= 1) {
		const monthStart = startOfMonth(subMonths(new Date(), index));
		buckets.set(format(monthStart, "yyyy-MM"), 0);
	}

	for (const event of events) {
		const key = format(event.date, "yyyy-MM");
		if (buckets.has(key)) {
			buckets.set(key, (buckets.get(key) ?? 0) + 1);
		}
	}

	return Array.from(buckets.entries()).map(([month, count]) => ({
		month,
		label: format(new Date(`${month}-01T00:00:00`), "MMM yy", { locale: fr }),
		count,
	}));
}

async function getEventsByNature(): Promise<DashboardEventsByNature[]> {
	const since = startOfMonth(subMonths(new Date(), EVENT_CHART_MONTHS - 1));
	const grouped = await prisma.event.groupBy({
		by: ["natureId"],
		where: { date: { gte: since } },
		_count: true,
	});

	const natureIds = grouped
		.map((row) => row.natureId)
		.filter((id): id is string => id != null);

	const natures = natureIds.length
		? await prisma.nature.findMany({ where: { id: { in: natureIds } } })
		: [];

	const labelById = new Map(natures.map((nature) => [nature.id, nature.label]));

	return grouped
		.map((row) => ({
			natureId: row.natureId ?? "none",
			label: row.natureId ? (labelById.get(row.natureId) ?? "—") : "Sans nature",
			count: row._count,
		}))
		.sort((a, b) => b.count - a.count);
}

async function getDashboardData(): Promise<DashboardData> {
	const today = startOfToday();
	const in7Days = inSevenDaysFromNow();
	const eventsSince = subDays(new Date(), 30);
	const dormantSince = subDays(new Date(), 90);

	const [kpis, priorityContacts, kanbanColumns, activiteBreakdown, labelBreakdown, recentEvents, eventsByMonth, eventsByNature, lastBackupAt] =
		await Promise.all([
			getKpis(today, in7Days, eventsSince, dormantSince),
			getPriorityContacts(in7Days),
			getKanbanBreakdown(),
			getActiviteBreakdown(),
			getLabelBreakdown(),
			getRecentEvents(),
			getEventsByMonth(),
			getEventsByNature(),
			getLastBackupAt(),
		]);

	return {
		kpis,
		priorityContacts,
		kanbanColumns,
		activiteBreakdown,
		labelBreakdown,
		recentEvents,
		eventsByMonth,
		eventsByNature,
		lastBackupAt,
	};
}

export const DashboardService = {
	getDashboardData,
};
