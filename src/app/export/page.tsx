import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/sidebar/AppSidebar";
import SidebarLayoutHeader from "@/components/layout/SidebarHeader";
import ExportContent from "@/components/data/ExportContent";
import { getExportSummary } from "@/data/export-service";

export default async function ExportPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const summary = await getExportSummary();

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="w-full">
				<SidebarLayoutHeader title="Gestion clients" className="max-w-full w-full" />
				<div className="overflow-y-auto">
					<main className="mx-auto flex-1 relative font-sans p-4 max-w-2xl">
						<h2 className="text-lg font-medium mb-6">Exporter</h2>
						<ExportContent summary={summary} />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
