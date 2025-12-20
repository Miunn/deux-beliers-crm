import ContactList from "@/components/common/ContactList";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { ContactService } from "@/data/contact-service";
import { ContactsProvider } from "@/context/ContactsContext";

export const metadata: Metadata = {
  title: "Deux Beliers CRM",
  description: "Deux Beliers CRM",
};

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
          <ContactsProvider defaultContacts={contacts}>
            <ContactList />
          </ContactsProvider>
        </main>
      </div>
    </div>
  );
}
