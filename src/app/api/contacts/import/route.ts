import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getImportWorkbookData, ImportValidationError } from "@/lib/import-workbook";

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const formData = await req.formData();
	const file = formData.get("file");
	if (!file || !(file instanceof Blob)) {
		return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
	}

	let data;
	try {
		data = getImportWorkbookData(await file.arrayBuffer());
	} catch (error) {
		if (error instanceof ImportValidationError) {
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: 400 },
			);
		}
		return NextResponse.json({ error: "Import échoué" }, { status: 400 });
	}

	const { contacts, events, labels, activites, natures, contactLabels, kanbanColumns } = data;

	const labelsByContact = new Map<string, string[]>();
	for (const cl of contactLabels) {
		const cid = String(cl["ContactId"]);
		const lid = String(cl["LabelId"]);
		if (!labelsByContact.has(cid)) labelsByContact.set(cid, []);
		labelsByContact.get(cid)!.push(lid);
	}

	await prisma.$transaction(
		async (tx) => {
			await tx.event.deleteMany({});
			await tx.contact.deleteMany({});
			await tx.label.deleteMany({});
			await tx.nature.deleteMany({});
			await tx.activite.deleteMany({});
			await tx.kanbanColumn.deleteMany({});

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

			if (kanbanColumns.length) {
				await tx.kanbanColumn.createMany({
					data: kanbanColumns.map((k) => ({
						id: String(k["Id"]),
						name: String(k["Name"] ?? k["Label"] ?? ""),
						color: String(k["Color"] ?? ""),
					})),
				});
			}

			if (contacts.length) {
				await tx.contact.createMany({
					data: contacts.map((c) => ({
						id: String(c["Id"]),
						active: c["Archive"] === "VRAI" ? false : true,
						nom: String(c["Nom"] ?? ""),
						activiteId: String(c["ActiviteId"] ?? "") || null,
						rappel: String(c["Rappel"] ?? "") ? new Date(String(c["Rappel"])) : null,
						ville: (c["Ville"] ?? null) as string | null,
						contact: (c["Contact"] ?? null) as string | null,
						telephone: (c["Telephone"] ?? null) as string | null,
						mail: (c["Mail"] ?? null) as string | null,
						observations: (c["Observations"] ?? null) as string | null,
						adresse: (c["Adresse"] ?? null) as string | null,
						horaires: (c["Horaires"] ?? null) as string | null,
						kanbanColumnId: String(c["KanbanColumnId"] ?? "") || null,
					})),
				});
			}

			for (const [contactId, labelIds] of labelsByContact.entries()) {
				if (!labelIds.length) continue;
				await tx.contact.update({
					where: { id: contactId },
					data: {
						labels: { connect: labelIds.map((id) => ({ id })) },
					},
				});
			}

			if (events.length) {
				await tx.event.createMany({
					data: events.map((e) => ({
						id: String(e["Id"]),
						contactId: String(e["ContactId"]),
						date: new Date(String(e["Date"])) as unknown as Date,
						natureId: String(e["NatureId"] ?? "") || null,
						commentaires: (e["Commentaires"] ?? null) as string | null,
					})),
				});
			}
		},
		{
			timeout: 60000,
		},
	);

	return NextResponse.json({ success: true });
}
