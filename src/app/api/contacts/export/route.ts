import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  const contacts = await prisma.contact.findMany({
    include: { activite: true },
    orderBy: { nom: "asc" },
  });

  const rows = contacts.map((c) => ({
    Nom: c.nom ?? "",
    Activite: c.activite?.label ?? "",
    Ville: c.ville ?? "",
    Contact: c.contact ?? "",
    Telephone: c.telephone ?? "",
    Mail: c.mail ?? "",
    Observations: c.observations ?? "",
    Adresse: c.adresse ?? "",
    Horaires: c.horaires ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="contacts.xlsx"',
    },
  });
}
