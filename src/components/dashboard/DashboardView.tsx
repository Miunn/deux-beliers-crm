import type { DashboardData } from "@/data/dashboard-service";

import DashboardEventCharts from "./DashboardEventCharts";
import DashboardFooterPanels from "./DashboardFooterPanels";
import { DashboardBreakdown, DashboardRecentEvents } from "./DashboardBreakdown";
import DashboardKanbanPipeline from "./DashboardKanbanPipeline";
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardPriorityList from "./DashboardPriorityList";

type Props = {
	data: DashboardData;
};

export default function DashboardView({ data }: Props) {
	return (
		<div className="mx-auto flex w-full flex-col gap-6">
			<DashboardKpiCards kpis={data.kpis} />

			<DashboardFooterPanels
				kpis={{
					dormantContacts: data.kpis.dormantContacts,
					uncategorizedKanban: data.kpis.uncategorizedKanban,
				}}
				lastBackupAt={data.lastBackupAt}
			/>

			<DashboardEventCharts eventsByMonth={data.eventsByMonth} eventsByNature={data.eventsByNature} />

			<div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
				<DashboardPriorityList contacts={data.priorityContacts} />
				<DashboardRecentEvents events={data.recentEvents} />
				<DashboardKanbanPipeline columns={data.kanbanColumns} />
				<DashboardBreakdown activites={data.activiteBreakdown} labels={data.labelBreakdown} />
			</div>
		</div>
	);
}
