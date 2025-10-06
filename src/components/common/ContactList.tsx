"use client";

import { useContacts } from "@/hooks/use-contacts";
import { Loader2, Plus } from "lucide-react";
import ContactCard from "./ContactCard";
import ContactDialog from "../dialogs/ContactDialog";
import { Button } from "../ui/button";
import ContactFilters from "./ContactFilters";

export default function ContactList() {
  const { data: contacts, error, isLoading } = useContacts();

  return (
    <>
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
        {isLoading && (
          <div className="col-span-full flex justify-center items-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {!isLoading && !error && contacts?.length === 0 && (
          <div className="col-span-full flex justify-center items-center h-full">
            <p className="text-muted-foreground">Aucun contact</p>
          </div>
        )}
        {error && <div>{error.message}</div>}
        {contacts?.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </>
  );
}
