"use client";

import {
  Bell,
  Calendar,
  Pen,
  Phone,
  Plus,
  Trash,
  UserRound,
} from "lucide-react";
import { Button } from "../ui/button";
import DeleteContact from "../dialogs/DeleteContact";
import ContactDialog from "../dialogs/ContactDialog";
import EventDialog from "../dialogs/EventDialog";
import ContactLabelsPopover from "../popovers/ContactLabelsPopover";
import { Badge } from "../ui/badge";
import ReminderPopover from "../popovers/ReminderPopover";
import { addWeeks } from "date-fns";
import { cn, textColorForBg } from "@/lib/utils";
import { ContactWithRelations } from "@/context/ContactsContext";

export default function ContactCard({
  contact,
}: {
  contact: ContactWithRelations;
}) {
  const lastEvent = contact.events
    ? contact.events.reduce((latest, event) => {
        const eventDate = new Date(event.date);
        return eventDate > new Date(latest.date) ? event : latest;
      }, contact.events[0])
    : null;

  return (
    <div
      className="h-full rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between gap-2 relative"
      data-contact-id={contact.id}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{contact.nom || "—"}</div>
            <div className="text-sm text-gray-600">
              {[contact.activite?.label, contact.ville]
                .filter(Boolean)
                .join(" • ")}
            </div>
          </div>

          <div>
            <ReminderPopover contact={contact} />
          </div>
        </div>

        {contact.rappel && (
          <div
            className={cn(
              "flex items-start gap-1 text-sm",
              contact.rappel <= addWeeks(new Date(), 1)
                ? "font-semibold text-destructive"
                : "",
            )}
          >
            <Bell className="size-4 shrink-0" />
            <p>{new Date(contact.rappel).toLocaleDateString()}</p>
          </div>
        )}

        <div className="text-sm text-gray-700 space-y-1">
          {contact.horaires ? (
            <div className="flex items-start gap-1">
              <Calendar className="size-4 shrink-0" />
              <div
                dangerouslySetInnerHTML={{
                  __html: `${String(contact.horaires).replace(/\n/g, "<br/>")}`,
                }}
              />
            </div>
          ) : null}
          {contact.contact ? (
            <div className="flex items-start gap-1">
              <UserRound className="size-4" /> {contact.contact}
            </div>
          ) : null}
          {contact.telephone ? (
            <div className="flex items-start gap-1">
              <Phone className="size-4 shrink-0" />
              <a
                className="text-indigo-700 underline"
                href={`tel:${contact.telephone}`}
              >
                {contact.telephone}
              </a>
            </div>
          ) : null}
          {lastEvent ? (
            <div className="flex items-start gap-1">
              <Calendar className="size-4 shrink-0" />
              <p className="line-clamp-3">
                <span className="font-medium"></span>
                {lastEvent.commentaires}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="w-full flex justify-between items-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {contact.labels.map((lb) => (
            <Badge
              key={`${lb.id}-${lb.label}`}
              style={{
                background: lb.color || "#eef2ff",
                color: textColorForBg(lb.color || "#eef2ff"),
              }}
            >
              {lb.label}
            </Badge>
          ))}
          <ContactLabelsPopover contact={contact}>
            <Button
              type="button"
              variant={"ghost"}
              size={"sm"}
              className="size-6"
              title="Ajouter un libellé"
            >
              <Plus />
            </Button>
          </ContactLabelsPopover>
        </div>

        <div className="flex flex-no-wrap">
          <ContactDialog mode="edit" contact={contact}>
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              title="Modifier le contact"
            >
              <Pen />
            </Button>
          </ContactDialog>
          <EventDialog contact={contact}>
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              title="Événements"
            >
              <Calendar />
            </Button>
          </EventDialog>
          <DeleteContact contact={contact}>
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              title="Supprimer le contact"
            >
              <Trash className="text-destructive" />
            </Button>
          </DeleteContact>
        </div>
      </div>
    </div>
  );
}
