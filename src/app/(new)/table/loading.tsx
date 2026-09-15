import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/ui/data-table";

export default function TableLoading() {
	return (
		<DataTable
			columns={columns}
			data={[]}
			isLoading
			showReminderWithinSevenDaysFilter
			showEventDateRangeFilter
			showLabelsFilter
		/>
	);
}
