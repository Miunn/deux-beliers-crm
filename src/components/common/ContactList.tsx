"use client";

import { useContactsContext } from "@/context/ContactsContext";
import { Plus } from "lucide-react";
import ContactCard from "./ContactCard";
import ContactDialog from "../dialogs/ContactDialog";
import { Button } from "../ui/button";
import ContactFilters from "./ContactFilters";
import { Contact, Label, Activite } from "../../../generated/prisma";

export default function ContactList({}: {
  defaultContacts: (Contact & { labels: Label[]; activite: Activite | null })[];
}) {
  const { contacts } = useContactsContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">
          {!contacts
            ? "Aucun contact"
            : contacts?.length === 0
            ? "Aucun contact"
            : `${contacts?.length} contacts`}
        </h2>
        <div className="flex items-end gap-2">
          <ContactFilters />
          <ContactDialog mode="create">
            <Button variant="outline">
              <Plus className="size-4 mr-2" />
              Créer un contact
            </Button>
          </ContactDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts?.length === 0 && (
          <div className="col-span-full flex justify-center items-center h-full">
            <p className="text-muted-foreground">Aucun contact</p>
          </div>
        )}
        {contacts?.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
