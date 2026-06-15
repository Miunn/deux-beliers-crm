import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/sidebar/AppSidebar";
import SidebarLayoutHeader from "@/components/layout/SidebarHeader";
import ImportContent from "@/components/data/ImportContent";

export default async function ImportPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="w-full">
				<SidebarLayoutHeader title="Gestion clients" className="max-w-full w-full" />
				<div className="overflow-y-auto">
					<main className="mx-auto flex-1 relative font-sans p-4 max-w-2xl">
						<h2 className="text-lg font-medium mb-6">Importer</h2>
						<ImportContent />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
