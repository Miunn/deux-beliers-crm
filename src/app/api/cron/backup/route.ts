import { NextRequest, NextResponse } from "next/server";
import { createBackup } from "@/data/backup-service";

function getCronSecret(req: NextRequest): string | null {
	const authHeader = req.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.slice("Bearer ".length);
	}
	return req.headers.get("X-Cron-Secret");
}

export async function POST(req: NextRequest) {
	const expectedSecret = process.env.CRON_SECRET;
	if (!expectedSecret) {
		return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
	}

	const secret = getCronSecret(req);
	if (secret !== expectedSecret) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const save = await createBackup("cron");
	return NextResponse.json(save, { status: 201 });
}
