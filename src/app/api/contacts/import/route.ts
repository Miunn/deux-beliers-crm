import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Row = Record<string, unknown>;

function readSheet<T extends Row>(wb: XLSX.WorkBook, name: string): T[] | null {
  const sheet = wb.Sheets[name];
  if (!sheet) return null;
  return XLSX.utils.sheet_to_json<T>(sheet);
}

function isIsoDate(s: string): boolean {
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

  const requiredSheets = [
    "Contacts",
    "Events",
    "Labels",
    "Activite",
    "Nature",
    "ContactLabels",
  ];
  const errors: string[] = [];

  for (const s of requiredSheets) {
    if (!workbook.SheetNames.includes(s)) {
      errors.push(`Feuille manquante: ${s}`);
    }
  }
  if (errors.length) {
    return NextResponse.json(
      { error: "Format invalide", details: errors },
      { status: 400 }
    );
  }

  const contacts = readSheet<Row>(workbook, "Contacts") ?? [];
  const events = readSheet<Row>(workbook, "Events") ?? [];
  const labels = readSheet<Row>(workbook, "Labels") ?? [];
  const activites = readSheet<Row>(workbook, "Activite") ?? [];
  const natures = readSheet<Row>(workbook, "Nature") ?? [];
  const contactLabels = readSheet<Row>(workbook, "ContactLabels") ?? [];

  // Validate headers presence
  //   const requireHeaders = (rows: Row[], headers: string[], sheet: string) => {
  //     if (rows.length === 0) return;
  //     const row = rows[0];
  //     console.log(row);

  //     for (const h of headers) {
  //       if (!(h in row)) errors.push(`Colonne manquante dans ${sheet}: ${h}`);
  //     }
  //   };

  //   console.log(contacts);

  //   requireHeaders(
  //     contacts,
  //     [
  //       "Id",
  //       "Nom",
  //       "ActiviteId",
  //       "Ville",
  //       "Contact",
  //       "Telephone",
  //       "Mail",
  //       "Observations",
  //       "Adresse",
  //       "Horaires",
  //       "Labels",
  //     ],
  //     "Contacts"
  //   );

  //   requireHeaders(
  //     events,
  //     [
  //       "Id",
  //       "Date",
  //       "NatureId",
  //       "Attendus",
  //       "DateTraitement",
  //       "Resultat",
  //       "ContactId",
  //       "ContactName",
  //     ],
  //     "Events"
  //   );

  //   requireHeaders(labels, ["Id", "Label", "Color"], "Labels");
  //   requireHeaders(activites, ["Id", "Label"], "Activite");
  //   requireHeaders(natures, ["Id", "Label"], "Nature");
  //   requireHeaders(contactLabels, ["ContactId", "LabelId"], "ContactLabels");

  // Referential checks
  const activiteIds = new Set(activites.map((r) => String(r["Id"])));
  const labelIds = new Set(labels.map((r) => String(r["Id"])));
  const natureIds = new Set(natures.map((r) => String(r["Id"])));
  const contactIds = new Set(contacts.map((r) => String(r["Id"])));

  for (const c of contacts) {
    const aid = String(c["ActiviteId"] ?? "").trim();
    if (aid && !activiteIds.has(aid)) {
      errors.push(`Contacts.ActiviteId inconnu: ${aid}`);
    }
  }

  for (const e of events) {
    const cid = String(e["ContactId"] ?? "").trim();
    if (!cid || !contactIds.has(cid)) {
      errors.push(`Events.ContactId invalide: ${cid || "(vide)"}`);
    }
    const nid = String(e["NatureId"] ?? "").trim();
    if (nid && !natureIds.has(nid)) {
      errors.push(`Events.NatureId inconnu: ${nid}`);
    }
    const date = String(e["Date"] ?? "");
    if (date && !isIsoDate(date)) errors.push(`Events.Date invalide: ${date}`);
    const dtrait = String(e["DateTraitement"] ?? "");
    if (dtrait && !isIsoDate(dtrait))
      errors.push(`Events.DateTraitement invalide: ${dtrait}`);
  }

  for (const cl of contactLabels) {
    const cid = String(cl["ContactId"] ?? "").trim();
    const lid = String(cl["LabelId"] ?? "").trim();
    if (!contactIds.has(cid))
      errors.push(`ContactLabels.ContactId inconnu: ${cid}`);
    if (!labelIds.has(lid))
      errors.push(`ContactLabels.LabelId inconnu: ${lid}`);
  }

  if (errors.length) {
    return NextResponse.json(
      { error: "Format invalide", details: errors },
      { status: 400 }
    );
  }

  // Group labels by contact for batched relation updates
  const labelsByContact = new Map<string, string[]>();
  for (const cl of contactLabels) {
    const cid = String(cl["ContactId"]);
    const lid = String(cl["LabelId"]);
    if (!labelsByContact.has(cid)) labelsByContact.set(cid, []);
    labelsByContact.get(cid)!.push(lid);
  }

  // Reset and import transactionally
  await prisma.$transaction(
    async (tx) => {
      // wipe in dependency order
      await tx.event.deleteMany({});
      await tx.contact.deleteMany({});
      await tx.label.deleteMany({});
      await tx.nature.deleteMany({});
      await tx.activite.deleteMany({});

      // create base tables
      if (activites.length) {
        await tx.activite.createMany({
          data: activites.map((a) => ({
            id: String(a["Id"]),
            label: String(a["Label"]),
          })),
        });
      }
      if (labels.length) {
        await tx.label.createMany({
          data: labels.map((l) => ({
            id: String(l["Id"]),
            label: String(l["Label"]),
            color: String(l["Color"]),
          })),
        });
      }
      if (natures.length) {
        await tx.nature.createMany({
          data: natures.map((n) => ({
            id: String(n["Id"]),
            label: String(n["Label"]),
          })),
        });
      }

      // contacts
      if (contacts.length) {
        await tx.contact.createMany({
          data: contacts.map((c) => ({
            id: String(c["Id"]),
            nom: String(c["Nom"] ?? ""),
            activiteId: String(c["ActiviteId"] ?? "") || null,
            rappel: String(c["Rappel"] ?? "")
              ? new Date(String(c["Rappel"]))
              : null,
            ville: (c["Ville"] ?? null) as string | null,
            contact: (c["Contact"] ?? null) as string | null,
            telephone: (c["Telephone"] ?? null) as string | null,
            mail: (c["Mail"] ?? null) as string | null,
            observations: (c["Observations"] ?? null) as string | null,
            adresse: (c["Adresse"] ?? null) as string | null,
            horaires: (c["Horaires"] ?? null) as string | null,
          })),
        });
      }

      console.log("Created contacts");

      // contact-labels
      console.log("Creating contact-labels, length: ", contactLabels.length);
      let counter = 0;
      for (const [contactId, labelIds] of labelsByContact.entries()) {
        if (!labelIds.length) continue;
        await tx.contact.update({
          where: { id: contactId },
          data: {
            labels: { connect: labelIds.map((id) => ({ id })) },
          },
        });
        counter += labelIds.length;
        if (counter % 50 === 0) {
          console.log("Created contact-labels: ", counter);
        }
      }

      console.log("Created contact-labels");

      // events
      if (events.length) {
        await tx.event.createMany({
          data: events.map((e) => ({
            id: String(e["Id"]),
            contactId: String(e["ContactId"]),
            date: new Date(String(e["Date"])) as unknown as Date,
            natureId: String(e["NatureId"] ?? "") || null,
            attendus: (e["Attendus"] ?? null) as string | null,
            date_traitement: String(e["DateTraitement"] ?? "")
              ? (new Date(String(e["DateTraitement"])) as unknown as Date)
              : null,
            resultat: (e["Resultat"] ?? null) as string | null,
          })),
        });
      }

      console.log("Created events");
    },
    {
      timeout: 60000,
    }
  );

  return NextResponse.json({ success: true });
}
