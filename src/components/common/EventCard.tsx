import { Contact, Event } from "../../../generated/prisma";
import { Nature } from "../../../generated/prisma";

export default function EventCard({
  e,
}: {
  e: Event & { nature: Nature | null; contact: Contact };
}) {
  return (
    <div className="p-3 text-sm flex items-center gap-3 border rounded-md">
      <div className="w-28 shrink-0">
        {new Date(e.date).toLocaleDateString()}
      </div>
      <div className="grow">
        <div className="font-medium">
          {e.contact.nom}
          {e.nature?.label ? ` • ${e.nature.label}` : ""}
        </div>
        {e.attendus && (
          <div className="text-muted-foreground line-clamp-2">{e.attendus}</div>
        )}
      </div>
    </div>
  );
}
