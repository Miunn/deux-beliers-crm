import { Suspense } from "react";
import { KanbanDashboard } from "@/components/common/KanbanDashboard";
import ContactsShell from "@/components/common/ContactsShell";
import ContactsViewToolbar from "@/components/layout/ContactsViewToolbar";
import { KanbanBoardProvider } from "@/components/ui/kanban";
import { ContactService } from "@/data/contact-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function KanbanPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const contacts = await ContactService.getContacts();

	return (
		<div className="flex flex-col gap-4">
			<ContactsShell defaultContacts={contacts}>
				<Suspense>
					<ContactsViewToolbar />
				</Suspense>
				<KanbanBoardProvider>
					<KanbanDashboard />
				</KanbanBoardProvider>
			</ContactsShell>
		</div>
	);
}
