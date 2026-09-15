import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardView from "@/components/dashboard/DashboardView";
import { DashboardService } from "@/data/dashboard-service";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
