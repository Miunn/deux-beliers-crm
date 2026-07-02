import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	DashboardActiviteBreakdown,
	DashboardLabelBreakdown,
	DashboardRecentEvent,
} from "@/data/dashboard-service";
import { buildLabelFilterUrl } from "@/lib/label-filter-url";
import { textColorForBg } from "@/lib/utils";

function formatEventDate(value: string) {
	return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

export function DashboardRecentEvents({ events }: { events: DashboardRecentEvent[] }) {
	return (
		<Card className="h-full py-0 gap-0">
			<CardHeader className="border-b py-4">
				<CardTitle className="text-base">Activité récente</CardTitle>
			</CardHeader>
			<CardContent className="px-0 py-0">
				{events.length === 0 ? (
					<p className="px-6 py-8 text-sm text-muted-foreground">Aucun événement enregistré.</p>
				) : (
					<ul className="max-h-[500px] divide-y overflow-y-auto">
						{events.map((event) => (
							<li key={event.id} className="px-6 py-4 space-y-1">
								<div className="flex items-start justify-between gap-3">
									<Link
										href={`/new?q=${encodeURIComponent(event.contactName)}`}
										className="font-medium hover:underline"
									>
										{event.contactName}
									</Link>
									<span className="text-xs text-muted-foreground shrink-0 tabular-nums">
										{formatEventDate(event.date)}
									</span>
								</div>
								{event.natureLabel ? (
									<p className="text-sm text-muted-foreground">{event.natureLabel}</p>
								) : null}
								{event.commentaires ? (
									<p className="text-sm line-clamp-2">{event.commentaires}</p>
								) : null}
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

export function DashboardBreakdown({
	activites,
	labels,
}: {
	activites: DashboardActiviteBreakdown[];
	labels: DashboardLabelBreakdown[];
}) {
	const maxActiviteCount = Math.max(...activites.map((item) => item.count), 1);

	return (
		<Card className="h-full py-0 gap-0">
			<CardHeader className="border-b py-4">
				<CardTitle className="text-base">Répartition</CardTitle>
			</CardHeader>
			<CardContent className="px-6 py-4 space-y-6">
				<div className="space-y-3">
					<p className="text-sm font-medium">Par activité</p>
					{activites.length === 0 ? (
						<p className="text-sm text-muted-foreground">Aucune activité renseignée.</p>
					) : (
						activites.slice(0, 6).map((item) => (
							<div key={item.id} className="space-y-1">
								<div className="flex items-center justify-between gap-2 text-sm">
									<span className="truncate">{item.label}</span>
									<span className="tabular-nums font-medium shrink-0">{item.count}</span>
								</div>
								<div className="h-2 rounded-full bg-muted overflow-hidden">
									<div
										className="h-full rounded-full bg-chart-1"
										style={{ width: `${Math.round((item.count / maxActiviteCount) * 100)}%` }}
									/>
								</div>
							</div>
						))
					)}
				</div>

				<div className="space-y-3">
					<p className="text-sm font-medium">Top libellés</p>
					{labels.length === 0 ? (
						<p className="text-sm text-muted-foreground">Aucun libellé utilisé.</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{labels.map((label) => (
								<Link key={label.id} href={buildLabelFilterUrl([label.id])}>
									<Badge
										style={{
											background: label.color || "#eef2ff",
											color: textColorForBg(label.color || "#eef2ff"),
										}}
									>
										{label.label} · {label.count}
									</Badge>
								</Link>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
