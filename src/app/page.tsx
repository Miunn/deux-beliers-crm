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

  // Compute current week range [Monday 00:00:00.000, Sunday 23:59:59.999]
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  const day = startOfWeek.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const events = await EventsService.getByDateRange(startOfWeek, endOfWeek);

  return (
    <>
      <Header title="Gestion clients" />
      <div className="font-sans min-h-screen p-8 gap-16 sm:p-20">
        <main className="container mx-auto flex flex-col gap-12">
          <ContactList defaultContacts={contacts} />

          <WeeklyEvents defaultEvents={events} />
        </main>
      </div>
    </>
  );
}
