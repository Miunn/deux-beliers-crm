import ContactTable from "@/components/table/ContactTable";
import Header from "@/components/layout/Header";
import { ContactService } from "@/data/contact-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/sidebar/AppSidebar";

export default async function TablePage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const contacts = await ContactService.getContacts();

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="w-full">
				<Header title="Gestion clients" />
				<div className="overflow-y-auto">
					<SidebarTrigger />
					<main className="mx-auto flex-1 relative font-sans p-4">
						<ContactTable data={contacts} />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
