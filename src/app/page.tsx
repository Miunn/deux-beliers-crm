import ContactList from "@/components/common/ContactList";
import Header from "@/components/layout/Header";
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
		<div className="flex flex-col h-screen overflow-hidden">
			<Header title="Gestion clients" />
			<div className="overflow-y-auto">
				<main className="container mx-auto flex-1 relative font-sans">
					<ContactsShell defaultContacts={contacts}>
						<ContactList />
					</ContactsShell>
				</main>
			</div>
		</div>
	);
}
