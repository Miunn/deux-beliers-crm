import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  for (const r of rows) {
    const nom = r["Nom"] ?? r["nom"] ?? r["NAME"] ?? r["name"];
    if (!nom) continue;

    const activiteLabel = r["Activite"] ?? r["Activité"] ?? r["activite"];
    let activiteId: string | undefined = undefined;
    if (
      activiteLabel &&
      typeof activiteLabel === "string" &&
      activiteLabel.trim()
    ) {
      const a = await prisma.activite.upsert({
        where: { label: activiteLabel },
        update: {},
        create: { label: activiteLabel },
      });
      activiteId = a.id;
    }

    await prisma.contact.create({
      data: {
        nom: String(nom),
        activite: activiteId ? { connect: { id: activiteId } } : undefined,
        ville: r["Ville"] ?? r["ville"] ?? null,
        contact: r["Contact"] ?? r["contact"] ?? null,
        telephone: r["Telephone"] ?? r["Téléphone"] ?? r["telephone"] ?? null,
        mail: r["Mail"] ?? r["Email"] ?? r["email"] ?? null,
        observations: r["Observations"] ?? r["observations"] ?? null,
        adresse: r["Adresse"] ?? r["adresse"] ?? null,
        horaires: r["Horaires"] ?? r["horaires"] ?? null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
