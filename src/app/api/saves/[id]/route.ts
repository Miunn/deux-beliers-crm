import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteBackup, getBackupRecord } from "@/data/backup-service";

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const backup = await getBackupRecord(id);
	if (!backup) {
		return NextResponse.json({ error: "Sauvegarde introuvable" }, { status: 404 });
	}

	await deleteBackup(id);
	return NextResponse.json({ success: true });
}
