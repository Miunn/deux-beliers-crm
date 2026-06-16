import ContactList from "@/components/common/ContactList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ContactService } from "@/data/contact-service";
import ContactsShell from "@/components/common/ContactsShell";

export default async function Home() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	const contacts = await ContactService.getContacts();

	return (
		<div className="flex-1 relative">
			<ContactsShell defaultContacts={contacts}>
				<ContactList variant="modern" />
			</ContactsShell>
		</div>
	);
}
