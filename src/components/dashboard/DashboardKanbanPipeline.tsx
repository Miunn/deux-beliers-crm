import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKanbanColumn } from "@/data/dashboard-service";

type Props = {
	columns: DashboardKanbanColumn[];
};

export default function DashboardKanbanPipeline({ columns }: Props) {
	const maxCount = Math.max(...columns.map((column) => column.count), 1);

	return (
		<Card className="h-full py-0 gap-0">
			<CardHeader className="border-b py-4">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-base">Pipeline Kanban</CardTitle>
					<Link href="/new/kanban" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
						Voir le kanban
					</Link>
				</div>
			</CardHeader>
			<CardContent className="px-6 py-4 space-y-3">
				{columns.length === 0 ? (
					<p className="text-sm text-muted-foreground">Aucune colonne kanban configurée.</p>
				) : (
					columns.map((column) => (
						<div key={column.id} className="space-y-1">
							<div className="flex items-center justify-between gap-2 text-sm">
								<span className="flex items-center gap-2 min-w-0">
									<span
										className="size-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: column.color }}
									/>
									<span className="truncate">{column.name}</span>
								</span>
								<span className="tabular-nums font-medium shrink-0">{column.count}</span>
							</div>
							<div className="h-2 rounded-full bg-muted overflow-hidden">
								<div
									className="h-full rounded-full transition-all"
									style={{
										width: `${Math.round((column.count / maxCount) * 100)}%`,
										backgroundColor: column.color,
									}}
								/>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
