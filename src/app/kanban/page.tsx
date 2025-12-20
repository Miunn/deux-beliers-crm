import ContactHeader from "@/components/common/ContactHeader";
import { KanbanDashboard } from "@/components/common/KanbanDashboard";
import Header from "@/components/layout/Header";
import { KanbanBoardProvider } from "@/components/ui/kanban";
import { ContactsProvider } from "@/context/ContactsContext";
import { ContactService } from "@/data/contact-service";

export default async function KanbanPage() {
  const contacts = await ContactService.getContacts();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header title="Gestion clients" />
      <div className="overflow-y-auto">
        <main className="max-w-[90%] mx-auto flex-1 relative font-sans space-y-2">
          <ContactsProvider defaultContacts={contacts}>
            <ContactHeader />
            <KanbanBoardProvider>
              <KanbanDashboard />
            </KanbanBoardProvider>
            {/*<KanbanDashboard defaultColumns={columns} />
            </KanbanBoardProvider>*/}
          </ContactsProvider>
        </main>
      </div>
    </div>
  );
}
