import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

function autoFitColumns<T extends Record<string, unknown>>(
  ws: XLSX.WorkSheet,
  rows: T[],
  headers: string[],
) {
  const widths = headers.map((h) => ({ wch: Math.max(8, String(h).length) }));
  for (const row of rows) {
    headers.forEach((h, i) => {
      const cell = (row as Record<string, unknown>)[h];
      const text = cell == null ? "" : String(cell);
      if (text.length > widths[i].wch)
        widths[i].wch = Math.min(60, text.length);
    });
  }
  (ws as unknown as Record<string, unknown>)["!cols"] = widths as unknown;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  const [contacts, activites, labels, natures, events] = await Promise.all([
    prisma.contact.findMany({
      include: { labels: true },
      orderBy: { nom: "asc" },
    }),
    prisma.activite.findMany({ orderBy: { label: "asc" } }),
    prisma.label.findMany({ orderBy: { label: "asc" } }),
    prisma.nature.findMany({ orderBy: { label: "asc" } }),
    prisma.event.findMany({
      orderBy: { date: "asc" },
      include: { contact: true },
    }),
  ]);

  const contactHeaders = [
    "Id",
    "Nom",
    "ActiviteId",
    "Ville",
    "Contact",
    "Telephone",
    "Mail",
    "Observations",
    "Adresse",
    "Horaires",
    "Rappel",
    "Labels",
  ];
  const contactRows = contacts.map((c) => ({
    Id: c.id,
    Nom: c.nom,
    ActiviteId: c.activiteId ?? "",
    Ville: c.ville ?? "",
    Contact: c.contact ?? "",
    Telephone: c.telephone ?? "",
    Mail: c.mail ?? "",
    Observations: c.observations ?? "",
    Adresse: c.adresse ?? "",
    Horaires: c.horaires ?? "",
    Rappel: c.rappel ? new Date(c.rappel).toISOString() : "",
    Labels: (c.labels ?? []).map((l) => l.label).join(", "),
  }));

  const activiteHeaders = ["Id", "Label"];
  const activiteRows = activites.map((a) => ({ Id: a.id, Label: a.label }));

  const labelHeaders = ["Id", "Label", "Color"];
  const labelRows = labels.map((l) => ({
    Id: l.id,
    Label: l.label,
    Color: l.color,
  }));

  const natureHeaders = ["Id", "Label"];
  const natureRows = natures.map((n) => ({ Id: n.id, Label: n.label }));

  const eventHeaders = [
    "Id",
    "Date",
    "NatureId",
    "Attendus",
    "DateTraitement",
    "Resultat",
    "ContactId",
    "ContactName",
  ];
  const eventRows = events.map((e) => ({
    Id: e.id,
    Date:
      e.date instanceof Date
        ? e.date.toISOString()
        : new Date(e.date).toISOString(),
    NatureId: e.natureId ?? "",
    Commentaires: e.commentaires ?? "",
    ContactId: e.contactId,
    ContactName:
      (e as { contact?: { nom?: string | null } }).contact?.nom ?? "",
  }));

  const contactLabelHeaders = ["ContactId", "LabelId"];
  const contactLabelRows = contacts.flatMap((c) =>
    c.labels.map((l) => ({ ContactId: c.id, LabelId: l.id })),
  );

  const wb = XLSX.utils.book_new();
  const wsActivites = XLSX.utils.json_to_sheet(activiteRows, {
    header: activiteHeaders,
  });
  const wsLabels = XLSX.utils.json_to_sheet(labelRows, {
    header: labelHeaders,
  });
  autoFitColumns(wsLabels, labelRows, labelHeaders);

  const wsNatures = XLSX.utils.json_to_sheet(natureRows, {
    header: natureHeaders,
  });
  autoFitColumns(wsNatures, natureRows, natureHeaders);

  const wsContacts = XLSX.utils.json_to_sheet(contactRows, {
    header: contactHeaders,
  });
  autoFitColumns(wsContacts, contactRows, contactHeaders);

  const wsContactLabels = XLSX.utils.json_to_sheet(contactLabelRows, {
    header: contactLabelHeaders,
  });
  autoFitColumns(wsContactLabels, contactLabelRows, contactLabelHeaders);

  const wsEvents = XLSX.utils.json_to_sheet(eventRows, {
    header: eventHeaders,
  });
  autoFitColumns(wsEvents, eventRows, eventHeaders);

  // Append sheets in requested order: Contacts, Events, Labels, Activite, Nature, ContactLabels
  XLSX.utils.book_append_sheet(wb, wsContacts, "Contacts");
  XLSX.utils.book_append_sheet(wb, wsEvents, "Events");
  XLSX.utils.book_append_sheet(wb, wsLabels, "Labels");
  autoFitColumns(wsActivites, activiteRows, activiteHeaders);
  XLSX.utils.book_append_sheet(wb, wsActivites, "Activite");
  XLSX.utils.book_append_sheet(wb, wsNatures, "Nature");
  XLSX.utils.book_append_sheet(wb, wsContactLabels, "ContactLabels");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="crm-export.xlsx"',
    },
  });
}
