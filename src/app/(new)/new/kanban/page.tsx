import { Suspense } from "react";
import { KanbanDashboard } from "@/components/common/KanbanDashboard";
import ContactsShell from "@/components/common/ContactsShell";
import ContactsViewToolbar from "@/components/layout/ContactsViewToolbar";
import { KanbanBoardProvider } from "@/components/ui/kanban";
import { ContactService } from "@/data/contact-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function KanbanPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const contacts = await ContactService.getContacts();

	return (
		<ContactsShell defaultContacts={contacts}>
			<div className="flex h-full min-h-0 flex-col gap-4">
				<Suspense>
					<ContactsViewToolbar className="shrink-0" />
				</Suspense>
				<div className="min-h-0 min-w-0 flex-1 overflow-hidden -mx-4">
					<KanbanBoardProvider>
						<KanbanDashboard />
					</KanbanBoardProvider>
				</div>
			</div>
		</ContactsShell>
	);
}
