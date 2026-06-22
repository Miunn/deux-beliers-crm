import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardView from "@/components/dashboard/DashboardView";
import { DashboardService } from "@/data/dashboard-service";

export default async function DashboardPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const data = await DashboardService.getDashboardData();

	return (
		<div className="flex-1 relative font-sans p-4">
			<DashboardView data={data} />
		</div>
	);
}
