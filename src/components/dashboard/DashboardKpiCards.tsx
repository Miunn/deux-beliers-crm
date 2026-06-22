import Link from "next/link";
import type { DashboardKpis } from "@/data/dashboard-service";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiItem = {
	label: string;
	value: number;
	href: string;
	variant?: "default" | "warning" | "muted";
};

function buildKpiItems(kpis: DashboardKpis): KpiItem[] {
	return [
		{ label: "Contacts actifs", value: kpis.activeContacts, href: "/new" },
		{
			label: "Rappels ≤ 7 jours",
			value: kpis.remindersWithin7d,
			href: "/new?reminder=7d",
			variant: kpis.remindersWithin7d > 0 ? "warning" : "default",
		},
		{
			label: "Rappels en retard",
			value: kpis.overdueReminders,
			href: "/new?reminder=overdue",
			variant: kpis.overdueReminders > 0 ? "warning" : "default",
		},
		{ label: "Sans rappel", value: kpis.contactsWithoutReminder, href: "/new?reminder=none" },
		{ label: "Événements (30 j)", value: kpis.eventsLast30d, href: "/table" },
		{ label: "Archivés", value: kpis.archivedContacts, href: "/new/archive", variant: "muted" },
	];
}

export default function DashboardKpiCards({ kpis }: { kpis: DashboardKpis }) {
	const items = buildKpiItems(kpis);

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
			{items.map((item) => (
				<Link key={item.label} href={item.href} className="group block min-w-0">
					<Card className="h-full py-4 transition-colors group-hover:border-primary/40">
						<CardContent className="px-4">
							<p className="text-xs text-muted-foreground truncate">{item.label}</p>
							<p
								className={cn(
									"mt-1 text-2xl font-semibold tabular-nums",
									item.variant === "warning" && item.value > 0 && "text-destructive",
									item.variant === "muted" && "text-muted-foreground",
								)}
							>
								{item.value}
							</p>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}
