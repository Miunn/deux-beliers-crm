import ContactList from "@/components/common/ContactList";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { ContactService } from "@/data/contact-service";
import ContactsShell from "@/components/common/ContactsShell";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
          <ContactsShell defaultContacts={contacts}>
            <ContactList />
          </ContactsShell>
        </main>
      </div>
    </>
  );
}
