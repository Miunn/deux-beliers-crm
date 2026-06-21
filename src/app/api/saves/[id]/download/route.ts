import fs from "fs/promises";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getBackupFilePath, getBackupRecord } from "@/data/backup-service";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	const { id } = await params;
	const [filePath, record] = await Promise.all([getBackupFilePath(id), getBackupRecord(id)]);
	if (!filePath || !record) {
		return new Response(JSON.stringify({ error: "Sauvegarde introuvable" }), {
			status: 404,
		});
	}

	const buf = await fs.readFile(filePath);
	return new Response(new Uint8Array(buf), {
		status: 200,
		headers: {
			"Content-Type":
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": `attachment; filename="${record.filename}"`,
		},
	});
}
