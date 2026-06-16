import ContactHeader from "@/components/common/ContactHeader";
import { KanbanDashboard } from "@/components/common/KanbanDashboard";
import { KanbanBoardProvider } from "@/components/ui/kanban";
import ContactsShell from "@/components/common/ContactsShell";
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
		<div className="mx-auto flex-1 relative font-sans space-y-2">
			<ContactsShell defaultContacts={contacts}>
				<ContactHeader />
				<KanbanBoardProvider>
					<KanbanDashboard />
				</KanbanBoardProvider>
				{/*<KanbanDashboard defaultColumns={columns} />
            </KanbanBoardProvider>*/}
			</ContactsShell>
		</div>
	);
}
