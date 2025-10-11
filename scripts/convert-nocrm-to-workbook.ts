#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

type IconvLite = { decode(input: Buffer, encoding: string): string };

declare const require: NodeJS.Require &
  ((id: string) => unknown) & { main?: unknown };

function safeRequireIconv(): IconvLite | null {
  try {
    return require("iconv-lite") as IconvLite;
  } catch {
    return null;
  }
}

// Minimal CSV parser for semicolon-delimited, with quoted fields and embedded newlines
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];
    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        cur.push(field);
        field = "";
      } else if (ch === "\n") {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = "";
      } else if (ch === "\r") {
        // ignore
      } else {
        field += ch;
      }
    }
  }
  // flush last field
  cur.push(field);
  rows.push(cur);
  return rows;
}

// removed unused ContactRow type

type ContactOut = {
  Id: string;
  Nom: string;
  ActiviteId?: string;
  Ville?: string;
  Contact?: string;
  Telephone?: string;
  Mail?: string;
  Observations?: string;
  Adresse?: string;
  Horaires?: string;
  Labels?: string; // comma-separated label ids
};

type EventOut = {
  Id: string;
  Date: string; // ISO
  NatureId?: string;
  Attendus?: string;
  DateTraitement?: string;
  Resultat?: string;
  ContactId: string;
  ContactName: string;
};

type LabelOut = { Id: string; Label: string; Color: string };
type ActiviteOut = { Id: string; Label: string };
type NatureOut = { Id: string; Label: string };
type ContactLabelOut = { ContactId: string; LabelId: string };

function sanitize(value: string): string {
  return value
    .replace(/\uFEFF/g, "") // BOM
    .replace(/\u00A0/g, " ") // NBSP -> space
    .replace(/\u200B/g, "") // zero-width space
    .trim();
}

function normalizeHeader(h: string): string {
  return sanitize(h);
}

function indexByHeader(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => (map[normalizeHeader(h)] = i));
  return map;
}

function parseTimestamp(input: string): string | null {
  // format: [YYYY-MM-DD HH:MM] ...
  const m = input.match(/^\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})]/);
  if (!m) return null;
  const iso = `${m[1]}T${m[2]}:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function extractTypeAndText(input: string): { type: string; text: string } {
  // After timestamp, usually "Label : text" or sometimes just free text.
  // Normalize the type (nature) to avoid including markers like "IJA" or date-like tokens.
  const after = input.replace(/^\[[^]]+\]\s*/, "");

  const splitIdx = after.indexOf(":");
  let rawType = "";
  let text = "";
  if (splitIdx >= 0) {
    rawType = after.slice(0, splitIdx).trim();
    text = after.slice(splitIdx + 1).trim();
  } else {
    const known = [
      "Livraison",
      "Abouti",
      "Non abouti",
      "E-mail",
      "Email",
      "Mail",
      "Rendez-vous",
      "Dégustation",
      "Degustation",
      "Appel",
      "Commande",
      "Relance",
      "Kdo",
      "Visite",
      "Note",
    ];
    const trimmed = after.trim();
    const found = known.find((k) => new RegExp(`^${k}\\b`, "i").test(trimmed));
    rawType = found || "Note";
    text = trimmed;
  }

  let type = rawType
    .replace(/\bIJA\b.*$/i, "")
    .replace(/\bIJA\b/i, "")
    .replace(
      /\b(\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?|\d{4}-\d{2}-\d{2})\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!type) type = "Note";
  return { type, text };
}

function makeId(prefix: string, counter: number): string {
  return `${prefix}_${counter}`;
}

function slugId(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 40) || "autre"
  );
}

function decodeCsvBuffer(buf: Buffer, preferred?: string): string {
  const iconv = safeRequireIconv();
  if (iconv && preferred) {
    return iconv.decode(buf, preferred);
  }
  if (iconv) {
    const utf8 = iconv.decode(buf, "utf8");
    const looksBrokenUtf8 = /Ã|Â/.test(utf8);
    if (looksBrokenUtf8) {
      return iconv.decode(buf, "win1252");
    }
    return utf8;
  }
  // Fallback when iconv-lite is not installed: try utf8, else latin1
  const trial = buf.toString("utf8");
  if (/Ã|Â/.test(trial)) {
    return buf.toString("latin1");
  }
  return trial;
}

function convert(inputPath: string, outputPath: string, encodingOpt?: string) {
  const buf = fs.readFileSync(inputPath);
  const content = decodeCsvBuffer(buf, encodingOpt);
  const rows = parseCsv(content);
  if (rows.length === 0) throw new Error("Empty CSV");
  const header = rows[0].map((h) => normalizeHeader(h));
  const H = indexByHeader(header);

  const contacts: ContactOut[] = [];
  const events: EventOut[] = [];
  const labels: Map<string, LabelOut> = new Map();
  const contactLabels: ContactLabelOut[] = [];
  const activites: Map<string, ActiviteOut> = new Map();
  const natures: Map<string, NatureOut> = new Map();

  const get = (r: string[], key: string) =>
    H[key] != null ? sanitize(r[H[key]] || "") : "";

  // Pre-create a few common natures
  [
    "Livraison",
    "Abouti",
    "Non abouti",
    "E-mail",
    "Rendez-vous",
    "Note",
  ].forEach((n) => natures.set(slugId(n), { Id: slugId(n), Label: n }));

  let eventCounter = 1;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const nom = get(r, "Lead") || get(r, "Nom") || "";
    const id = get(r, "ID") || get(r, "Id") || String(20000000 + i);
    const contactField = get(r, "Contact");
    const telephone = get(r, "Téléphone") || get(r, "Telephone");
    const mail = get(r, "E-mail") || get(r, "Mail");
    const adresse = get(r, "Adresse");
    const cp = get(r, "Code postal");
    const ville = get(r, "Ville");
    const horaires = get(r, "Horaires");
    const site = get(r, "Site");
    const categorie = get(r, "Catégorie") || get(r, "Categorie");
    const description = get(r, "Description");
    const tags = get(r, "tags");

    // Activite from Catégorie if present
    if (categorie) {
      const aid = slugId(categorie);
      if (!activites.has(aid))
        activites.set(aid, { Id: aid, Label: categorie });
    }

    // Labels from tags (comma or semicolon separated)
    const tagItems = (tags || "")
      .split(/[,;#]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const labelIds: string[] = [];
    for (const t of tagItems) {
      const lid = slugId(t);
      if (!labels.has(lid)) {
        labels.set(lid, { Id: lid, Label: t, Color: "gray" });
      }
      labelIds.push(lid);
      contactLabels.push({ ContactId: String(id), LabelId: lid });
    }

    const observations = [
      site ? `Site: ${site}` : "",
      cp ? `CP: ${cp}` : "",
      description || "",
    ]
      .filter(Boolean)
      .join("\n\n");

    contacts.push({
      Id: String(id),
      Nom: nom,
      ActiviteId: categorie ? slugId(categorie) : undefined,
      Ville: ville || undefined,
      Contact: contactField || undefined,
      Telephone: telephone || undefined,
      Mail: mail || undefined,
      Observations: observations || undefined,
      Adresse: adresse || undefined,
      Horaires: horaires || undefined,
      Labels: labelIds.join(",") || undefined,
    });

    // Parse any cells that contain timestamped comments into events (covers "Comment N" and others like "Commentaire")
    for (let j = 0; j < r.length; j++) {
      const cell = r[j];
      if (!cell) continue;
      if (!/\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}\]/.test(cell)) continue;
      const chunks = cell
        .split(/;(?=\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}\])/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const c of chunks) {
        const ts = parseTimestamp(c);
        if (!ts) continue;
        const { type, text } = extractTypeAndText(c);
        const nid = slugId(type);
        if (!natures.has(nid)) natures.set(nid, { Id: nid, Label: type });
        events.push({
          Id: makeId("evt", eventCounter++),
          Date: ts,
          NatureId: nid,
          Resultat: text,
          ContactId: String(id),
          ContactName: nom,
        });
      }
    }
  }

  // Build sheets
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const wsContacts = XLSX.utils.json_to_sheet(contacts);
  XLSX.utils.book_append_sheet(wb, wsContacts, "Contacts");

  const wsEvents = XLSX.utils.json_to_sheet(events);
  XLSX.utils.book_append_sheet(wb, wsEvents, "Events");

  const wsLabels = XLSX.utils.json_to_sheet(Array.from(labels.values()));
  XLSX.utils.book_append_sheet(wb, wsLabels, "Labels");

  const wsActivite = XLSX.utils.json_to_sheet(Array.from(activites.values()));
  XLSX.utils.book_append_sheet(wb, wsActivite, "Activite");

  const wsNature = XLSX.utils.json_to_sheet(Array.from(natures.values()));
  XLSX.utils.book_append_sheet(wb, wsNature, "Nature");

  const wsContactLabels = XLSX.utils.json_to_sheet(contactLabels);
  XLSX.utils.book_append_sheet(wb, wsContactLabels, "ContactLabels");

  XLSX.writeFile(wb, outputPath);
}

function main() {
  const input = process.argv[2];
  const output =
    process.argv[3] || path.join(process.cwd(), "nocrm-converted.xlsx");
  if (!input) {
    console.error(
      "Usage: ts-node scripts/convert-nocrm-to-workbook.ts <input.csv> [output.xlsx]"
    );
    process.exit(1);
  }
  convert(input, output, "win1252");
  console.log(`Wrote ${output}`);
}

if ((require as unknown as { main?: unknown }).main === module) {
  main();
}
