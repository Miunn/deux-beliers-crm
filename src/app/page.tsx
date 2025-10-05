import ContactList from "@/components/common/ContactList";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";

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

  return (
    <>
      <Header title="Deux Beliers CRM" />
      <div className="font-sans min-h-screen p-8 gap-16 sm:p-20">
        <main className="container mx-auto flex flex-col gap-4">
          <ContactList />
        </main>
      </div>
    </>
  );
}
