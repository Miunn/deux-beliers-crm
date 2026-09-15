import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resendVoucher, VoucherActionError } from "@/data/vouchers-service";

function parseId(raw: string): number | null {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) return null;
	return id;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const id = parseId((await params).id);
	if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

	try {
		const data = await resendVoucher(id);
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof VoucherActionError) {
			const status = error.status === 401 ? 502 : error.status;
			return NextResponse.json({ error: error.message }, { status });
		}
		const message = error instanceof Error ? error.message : "Impossible de renvoyer l'e-mail";
		const status = message.includes("configurés") ? 503 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}
