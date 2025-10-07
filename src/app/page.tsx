import ContactList from "@/components/common/ContactList";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import WeeklyEvents from "@/components/common/WeeklyEvents";
import { ContactService } from "@/data/contact-service";
import { EventsService } from "@/data/events-service";

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
  const events = await EventsService.getByDateRange(
    new Date(),
    new Date(new Date().setDate(new Date().getDate() + 7))
  );

  return (
    <>
      <Header title="Deux Beliers CRM" />
      <div className="font-sans min-h-screen p-8 gap-16 sm:p-20">
        <main className="container mx-auto flex flex-col gap-12">
          <ContactList defaultContacts={contacts} />

          <WeeklyEvents defaultEvents={events} />
        </main>
      </div>
    </>
  );
}
