import ContactList from "@/components/common/ContactList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { ContactService } from "@/data/contact-service";
import ContactsShell from "@/components/common/ContactsShell";

export const metadata: Metadata = {
	title: "Deux Beliers CRM",
	description: "Deux Beliers CRM",
};

export default async function ArchivePage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const contacts = await ContactService.getContacts(undefined, undefined, undefined, undefined, false);

	return (
		<div className="pb-8 sm:pb-20">
			<ContactsShell defaultContacts={contacts}>
				<ContactList variant="modern" />
			</ContactsShell>
		</div>
	);
}
