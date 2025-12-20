"use client";

import { Plus } from "lucide-react";
import ContactDialog from "../dialogs/ContactDialog";
import { Button } from "../ui/button";
import ContactFilters from "./ContactFilters";
import { cn } from "@/lib/utils";
import { useContactsContext } from "@/context/ContactsContext";

export default function ContactHeader() {
  const { contacts } = useContactsContext();

  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-background p-8",
        "grid grid-cols-[auto_1fr] gap-4",
        "border border-t-0 rounded-b-2xl drop-shadow-md",
      )}
    >
      <h2 className="text-xl text-nowrap font-medium">
        {!contacts
          ? "Aucun contact"
          : contacts?.length === 0
            ? "Aucun contact"
            : `${contacts?.length} contacts`}
      </h2>
      <div className="flex flex-wrap justify-end gap-2">
        <ContactFilters />
        <ContactDialog mode="create">
          <Button variant="outline">
            <Plus className="size-4 mr-2" />
            Créer un contact
          </Button>
        </ContactDialog>
      </div>
    </div>
  );
}
