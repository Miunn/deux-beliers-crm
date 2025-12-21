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

export default async function ArchivePage() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) redirect("/sign-in");

  const contacts = await ContactService.getContacts(
    undefined,
    undefined,
    undefined,
    undefined,
    false,
  );

  return (
    <>
      <Header title="Gestion clients" />
      <div className="font-sans min-h-screen px-8 pb-8 gap-16 sm:px-20 sm:pb-20">
        <main className="container mx-auto flex flex-col gap-12">
          <ContactsProvider defaultContacts={contacts}>
            <ContactList />
          </ContactsProvider>
        </main>
      </div>
    </>
  );
}
