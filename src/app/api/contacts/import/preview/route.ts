import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseImportWorkbook } from "@/lib/import-workbook";

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const formData = await req.formData();
	const file = formData.get("file");
	if (!file || !(file instanceof Blob)) {
		return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
	}

	const preview = parseImportWorkbook(await file.arrayBuffer());
	return NextResponse.json(preview);
}
