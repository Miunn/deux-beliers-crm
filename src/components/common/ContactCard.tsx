"use client";

import { Calendar, Pen, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Activite, Contact, Label } from "../../../generated/prisma";
import DeleteContact from "../dialogs/DeleteContact";
import ContactDialog from "../dialogs/ContactDialog";
import EventDialog from "../dialogs/EventDialog";
import ContactLabelsPopover from "../popovers/ContactLabelsPopover";
import { Badge } from "../ui/badge";

function textColorForBg(bg: string): string {
  try {
    const c = bg.replace("#", "");
    const r = parseInt(c.length === 3 ? c[0] + c[0] : c.slice(0, 2), 16);
    const g = parseInt(c.length === 3 ? c[1] + c[1] : c.slice(2, 4), 16);
    const b = parseInt(c.length === 3 ? c[2] + c[2] : c.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#111" : "#fff";
  } catch {
    return "#111";
  }
}

export default function ContactCard({
  contact,
}: {
  contact: Contact & { labels: Label[]; activite: Activite | null };
}) {
  console.log(contact);
  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between gap-2 relative">
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
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          {contact.mail && (
            <div>
              Email:{" "}
              <a
                className="text-indigo-700 underline"
                href={`mailto:${contact.mail}`}
              >
                {contact.mail}
              </a>
            </div>
          )}
          {contact.telephone && (
            <div>
              Tél.:{" "}
              <a
                className="text-indigo-700 underline"
                href={`tel:${contact.telephone}`}
              >
                {contact.telephone}
              </a>
            </div>
          )}
          {contact.contact && <div>Contact: {contact.contact}</div>}
          {contact.adresse && (
            <div
              dangerouslySetInnerHTML={{
                __html: `Adresse: ${String(contact.adresse).replace(
                  /\n/g,
                  "<br/>"
                )}`,
              }}
            />
          )}
          {contact.horaires && (
            <div
              dangerouslySetInnerHTML={{
                __html: `Horaires: ${String(contact.horaires).replace(
                  /\n/g,
                  "<br/>"
                )}`,
              }}
            />
          )}
          {contact.observations && (
            <div className="text-gray-600">Obs.: {contact.observations}</div>
          )}
        </div>
      </div>

      <div className="w-full flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
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
              size={"icon"}
              title="Ajouter un libellé"
            >
              <Plus />
            </Button>
          </ContactLabelsPopover>
        </div>

        <div>
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
          <EventDialog contactId={contact.id}>
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
