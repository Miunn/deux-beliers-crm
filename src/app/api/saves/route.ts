import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBackup, getDiskState, listBackups } from "@/data/backup-service";

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const [saves, disk] = await Promise.all([listBackups(), getDiskState()]);
	return NextResponse.json({ saves, disk });
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const save = await createBackup("manual");
	return NextResponse.json(save, { status: 201 });
}
